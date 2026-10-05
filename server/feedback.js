import { db, json, cors, requireConfig, requireUser, canAccessOrder, forbidden } from "./_lib.js";

// Customer-facing — requires sign-in (Firebase ID token).
//
// GET  /api/feedback
//   Looks through the SIGNED-IN user's own orders (by userId, not by any
//   browser-local list) for one that is "awaiting feedback" AND whose 2-day
//   deadline has passed with nothing submitted yet. Used by Checkout.jsx to
//   block a new order until that feedback is in.
//
// POST /api/feedback  { orderNumber, packing, safeDelivery, taste, comment }
//   Records feedback on the order (owner or admin only) and clears the block.
export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    requireConfig();
    const user = await requireUser(req);

    if (req.method === "GET") {
      // Single-field where; the rest is filtered in memory (no composite index).
      const snap = await db.collection("orders").where("userId", "==", user.uid).get();
      const now = Date.now();
      const overdue = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((o) => o.feedbackStatus === "awaiting" && o.feedbackDeadline && new Date(o.feedbackDeadline).getTime() < now)
        .sort((a, b) => new Date(a.feedbackDeadline).getTime() - new Date(b.feedbackDeadline).getTime());
      return json(res, 200, { blocking: overdue[0] || null });
    }

    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
    const { orderNumber, packing, safeDelivery, taste, comment = "" } = req.body || {};
    const n = String(orderNumber || "");
    if (!/^NM\d{6}$/.test(n)) return json(res, 400, { error: "Invalid order number" });
    for (const [label, value] of [["packing", packing], ["safeDelivery", safeDelivery], ["taste", taste]]) {
      if (!(Number(value) >= 1 && Number(value) <= 5)) return json(res, 400, { error: `${label} rating must be between 1 and 5` });
    }

    const snap = await db.collection("orders").where("orderNumber", "==", n).limit(1).get();
    if (snap.empty) return json(res, 404, { error: "Order not found" });
    const doc = snap.docs[0];
    if (!canAccessOrder(user, doc.data())) throw forbidden();

    const feedback = {
      packing: Number(packing),
      safeDelivery: Number(safeDelivery),
      taste: Number(taste),
      comment: String(comment || "").trim(),
      submittedAt: new Date().toISOString(),
    };
    await doc.ref.update({ feedback, feedbackStatus: "submitted" });
    return json(res, 200, { ok: true, feedback });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
