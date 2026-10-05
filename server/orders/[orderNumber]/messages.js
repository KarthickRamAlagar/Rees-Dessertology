import { db, json, cors, requireConfig, requireUser, canAccessOrder, forbidden } from "../../_lib.js";

// Customer-facing per-order payment chat (OrderChatRoom.jsx). Requires
// sign-in; GET is allowed for the order's owner (or an admin), POST only for
// the owner.
//
// A customer can post:
//   - { type: "text", text }          a plain message
//   - { type: "payment_notice" }      "I've paid" — the server fills in the
//                                     customer name, order number and amount
//                                     from the ORDER; nothing is taken from
//                                     the client, so it can't be spoofed.
//
// Deciding a notice (Payment received / Not received) is admin-only — see the
// paymentStatus PUT in api/admin/orders/[id].js, which also settles the
// notice bubble. Older "payment" (UTR/screenshot) messages may still exist
// in a thread; they're returned as-is and the UI only displays them.
export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    requireConfig();
    const user = await requireUser(req);
    const n = String(req.query.orderNumber || "");
    if (!/^NM\d{6}$/.test(n)) return json(res, 400, { error: "Invalid order number" });

    const orderSnap = await db.collection("orders").where("orderNumber", "==", n).limit(1).get();
    if (orderSnap.empty) return json(res, 404, { error: "Order not found" });
    const orderDoc = orderSnap.docs[0];
    const order = orderDoc.data();
    if (!canAccessOrder(user, order)) throw forbidden();

    if (req.method === "GET") {
      const msgSnap = await orderDoc.ref.collection("messages").orderBy("createdAt", "asc").get();
      const messages = msgSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return json(res, 200, { messages, order: { id: orderDoc.id, ...order } });
    }

    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
    if (order.status === "delivered") return json(res, 409, { error: "This order is delivered — its chat has been closed." });
    // Posting as the customer is for the order's owner only (an admin reads
    // via this endpoint but replies through api/admin/orders/[id]/messages.js).
    if (order.userId !== user.uid) throw forbidden("Only the customer who placed this order can post here.");

    const { type = "text", text = "" } = req.body || {};
    if (!["text", "payment_notice"].includes(type)) return json(res, 400, { error: "Invalid message type" });

    const customerName = order.userName || user.name || order.shippingAddress?.fullName || "Customer";
    const now = new Date().toISOString();

    if (type === "text") {
      if (!String(text).trim()) return json(res, 400, { error: "Message text is required" });
      const message = { type: "text", text: String(text).trim().slice(0, 1000), sender: { kind: "customer", name: customerName }, createdAt: now };
      const ref = await orderDoc.ref.collection("messages").add(message);
      return json(res, 201, { message: { id: ref.id, ...message } });
    }

    // --- "I've paid" notice -------------------------------------------
    if (order.paymentMethod !== "upi") return json(res, 400, { error: "Only QR/UPI orders have a payment chat." });
    const amount = Number(order.total || 0);

    // Transaction so a double-tap can't post two pending notices. If the
    // admin had marked the payment "Not received", this tap resets the order
    // back to pending and reopens the notice.
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(orderDoc.ref);
      const cur = snap.data();
      if (cur.paymentStatus === "paid") {
        throw Object.assign(new Error("This payment is already confirmed."), { statusCode: 409 });
      }
      if (cur.paymentStatus !== "failed" && cur.paymentNotice?.status === "pending") {
        throw Object.assign(new Error("You've already told us — waiting for the admin to confirm."), { statusCode: 409 });
      }
      tx.update(orderDoc.ref, { paymentStatus: "pending", paymentNotice: { status: "pending", amount, submittedAt: now } });
    });

    const message = {
      type: "payment_notice",
      text: "",
      userName: customerName,
      orderNumber: order.orderNumber,
      amount,
      status: "pending",
      sender: { kind: "customer", name: customerName },
      createdAt: now,
    };
    const ref = await orderDoc.ref.collection("messages").add(message);
    return json(res, 201, { message: { id: ref.id, ...message } });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
