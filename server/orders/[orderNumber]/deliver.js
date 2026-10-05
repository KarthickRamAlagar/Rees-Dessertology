import { db, json, cors, requireConfig, requireUser, canAccessOrder, forbidden, deleteChat } from "../../_lib.js";

// Customer-facing — requires sign-in AND ownership of the order (or admin).
// Lets the person who placed the order
// confirm it has arrived. Deliberately narrow: only a "shipped" order can be
// moved to "delivered" here, and nothing else about the order can be changed
// through this endpoint (status transitions beyond that stay admin-only in
// api/admin/orders/[id].js).
export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    requireConfig();
    const user = await requireUser(req);
    if (req.method !== "PUT") return json(res, 405, { error: "Method not allowed" });
    const n = String(req.query.orderNumber || "");
    if (!/^NM\d{6}$/.test(n)) return json(res, 400, { error: "Invalid order number" });

    const snap = await db.collection("orders").where("orderNumber", "==", n).limit(1).get();
    if (snap.empty) return json(res, 404, { error: "Order not found" });
    const doc = snap.docs[0];
    const order = doc.data();
    if (!canAccessOrder(user, order)) throw forbidden();
    if (order.status !== "shipped") return json(res, 400, { error: "Order can only be marked delivered once it has shipped." });

    const now = new Date().toISOString();
    const history = [...(order.statusHistory || []), { step: "delivered", timestamp: now }];
    const patch = { status: "delivered", statusHistory: history };
    // The 2-day feedback window starts when the admin confirms payment (see
    // admin/orders/[id].js). Safety net: if it somehow never started, start
    // it now that the order is delivered.
    if (order.feedbackStatus == null) {
      patch.feedbackStatus = "awaiting";
      patch.feedbackDeadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    }

    await doc.ref.update(patch);
    // Order cycle is over — delete the whole payment chat to save storage.
    await deleteChat(doc.ref);
    const updated = await doc.ref.get();
    return json(res, 200, { order: { _id: updated.id, id: updated.id, ...updated.data() } });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
