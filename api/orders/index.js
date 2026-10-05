import { db, json, cors, requireConfig, requireUser, FieldValue } from "../_lib.js";

const LOW_STOCK_THRESHOLD = 5;

function toOrder(doc) {
  return { _id: doc.id, id: doc.id, ...doc.data() };
}

// Reserves stock for every line item inside ONE Firestore transaction —
// this is the Firestore-native replacement for Sanity's ifRevisionId
// retry-loop. A transaction automatically retries itself if another
// concurrent transaction touched the same product document, and it aborts
// (throwing) if the commit would be invalid (not enough stock) — no manual
// retry loop needed, and no half-applied writes across line items within
// one attempt.
//
// IMPORTANT: Firestore transactions require every read to happen before
// any write (mixing get/update per item, one at a time, throws "Firestore
// transactions require all reads to be executed before all writes"). So
// with more than one line item we must read ALL product docs first, THEN
// validate stock for all of them, THEN write all the updates — never
// interleave get/update item by item.
async function reserveStockInTransaction(tx, items) {
  const withProduct = items.filter((i) => i.productId);
  if (!withProduct.length) return;

  // 1. All reads first.
  const refs = withProduct.map((i) => db.collection("products").doc(i.productId));
  const snaps = await Promise.all(refs.map((ref) => tx.get(ref)));

  // 2. Validate stock for every item before writing anything.
  const updates = [];
  for (let idx = 0; idx < withProduct.length; idx++) {
    const item = withProduct[idx];
    const snap = snaps[idx];
    if (!snap.exists) continue; // product was deleted — nothing to decrement
    const current = Number(snap.data().stockQuantity || 0);
    if (current < item.quantity) {
      const err = new Error(`Only ${current} left in stock`);
      err.statusCode = 409; err.code = "OUT_OF_STOCK"; err.productId = item.productId; err.available = current;
      throw err;
    }
    const next = current - item.quantity;
    const patch = { stockQuantity: next };
    if (next === 0) patch.inStock = false;
    // First time this product's stock drops to the threshold or below —
    // timestamp it so the admin dashboard can show when it happened.
    if (next <= LOW_STOCK_THRESHOLD && current > LOW_STOCK_THRESHOLD) patch.lowStockAlertAt = new Date().toISOString();
    updates.push({ ref: refs[idx], patch });
  }

  // 3. All writes last.
  for (const { ref, patch } of updates) tx.update(ref, patch);
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    requireConfig();
    const user = await requireUser(req);
    if (req.method === "GET") {
      // GET /api/orders?mine=1 — the signed-in customer's own orders, found
      // by userId (so it works from any browser/device/incognito window).
      // Single-field where only; sorting happens in memory because
      // where(userId) + orderBy(createdAt) would need a composite index.
      // Orders placed before sign-in existed have no userId and won't appear.
      const snap = await db.collection("orders").where("userId", "==", user.uid).get();
      const orders = snap.docs.map(toOrder).sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
      return json(res, 200, { orders });
    }
    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

    const { address, delivery = "standard", payment, items = [] } = req.body || {};
    if (!address || !payment || !items.length) return json(res, 400, { error: "Invalid order payload" });
    if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.pincode) return json(res, 400, { error: "Incomplete shipping address" });
    if (!["standard", "express"].includes(delivery)) return json(res, 400, { error: "Invalid delivery option" });
    if (!["upi"].includes(payment)) return json(res, 400, { error: "Invalid payment method" });

    // SECURITY: never trust a price the browser sends. Look up every item
    // that has a product reference and use the real stored price instead.
    // Items with no productId (shouldn't normally happen from the
    // storefront, but kept as a fallback) use the client-sent price.
    const productIds = [...new Set(items.map((i) => i.productId).filter(Boolean))];
    const priceById = {};
    if (productIds.length) {
      const snaps = await Promise.all(productIds.map((id) => db.collection("products").doc(id).get()));
      for (const s of snaps) if (s.exists) priceById[s.id] = Number(s.data().price || 0);
    }

    const resolvedItems = items.map((i) => {
      const resolvedPrice = i.productId && priceById[i.productId] != null ? priceById[i.productId] : Number(i.price || 0);
      return {
        productId: i.productId || null,
        productName: String(i.name || "Product"),
        weight: i.weight || "",
        quantity: Math.max(1, Number(i.quantity || 1)),
        price: resolvedPrice,
      };
    });

    try {
      await db.runTransaction(async (tx) => {
        await reserveStockInTransaction(tx, resolvedItems);
      });
    } catch (e) {
      if (e.code === "OUT_OF_STOCK") {
        const name = resolvedItems.find((i) => i.productId === e.productId)?.productName || "an item";
        return json(res, 409, { error: `Sorry, "${name}" just sold out — only ${e.available} left.`, code: e.code });
      }
      return json(res, e.statusCode || 500, { error: e.message });
    }

    const subtotal = resolvedItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const deliveryFee = delivery === "express" ? 79 : 0;
    let total = subtotal + deliveryFee;

    // TEST_MODE: while testing the real QR-scan -> pay -> admin-confirms
    // pipeline end to end, force the grand total to ₹1 so a real UPI
    // payment can be made for almost nothing. subtotal/deliveryFee still
    // show the real cart math on the order (so line items read correctly),
    // only the amount actually due is overridden. Set TEST_MODE=true in
    // .env for this; leave it unset/false (the default) in production so
    // customers are charged the real total.
    const TEST_MODE = String(process.env.TEST_MODE).toLowerCase() === "true";
    if (TEST_MODE) total = 1;

    const now = new Date().toISOString();
    const orderNumber = "NM" + Math.floor(100000 + Math.random() * 900000);

    const doc = {
      orderNumber,
      items: resolvedItems,
      shippingAddress: address,
      deliveryOption: delivery,
      paymentMethod: payment,
      // QR/UPI is the only payment method. The order starts "pending" and is
      // only marked paid once an admin explicitly confirms it (via the
      // payment chat, see admin/orders/[id].js).
      paymentStatus: "pending",
      status: "placed",
      statusHistory: [{ step: "placed", timestamp: now }],
      subtotal, deliveryFee, total,
      // Flag so the admin dashboard/order list can tell a ₹1 test order
      // apart from a real one at a glance; absent/false in production.
      ...(TEST_MODE ? { testMode: true } : {}),
      // Who placed it — every customer-facing order endpoint checks this.
      userId: user.uid,
      userName: user.name || (user.email ? user.email.split("@")[0] : "Customer"),
      userEmail: user.email || "",
      createdAt: now,
    };

    let orderId;
    try {
      // Order doc + the owner's users/{uid}.orderNumbers list are written
      // atomically in one batch. arrayUnion appends without clobbering older
      // entries; merge:true creates the users doc if the session call
      // somehow hasn't run yet (it never overwrites createdAt/role).
      const orderRef = db.collection("orders").doc();
      const batch = db.batch();
      batch.set(orderRef, doc);
      batch.set(
        db.collection("users").doc(user.uid),
        { uid: user.uid, email: user.email || "", orderNumbers: FieldValue.arrayUnion(orderNumber) },
        { merge: true }
      );
      await batch.commit();
      orderId = orderRef.id;
    } catch (e) {
      // Best-effort rollback of the stock we just reserved if the order
      // document itself couldn't be written. Same rule applies: all reads
      // before any writes.
      await db.runTransaction(async (tx) => {
        const withProduct = resolvedItems.filter((i) => i.productId);
        const refs = withProduct.map((i) => db.collection("products").doc(i.productId));
        const snaps = await Promise.all(refs.map((ref) => tx.get(ref)));
        for (let idx = 0; idx < withProduct.length; idx++) {
          const snap = snaps[idx];
          if (!snap.exists) continue;
          tx.update(refs[idx], { stockQuantity: Number(snap.data().stockQuantity || 0) + withProduct[idx].quantity, inStock: true });
        }
      });
      throw e;
    }
    return json(res, 201, { order: { _id: orderId, id: orderId, ...doc } });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
