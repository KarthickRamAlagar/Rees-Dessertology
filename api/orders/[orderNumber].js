import { db, json, cors, requireConfig, requireUser, canAccessOrder, forbidden } from "../_lib.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    requireConfig();
    const user = await requireUser(req);
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
    const n = String(req.query.orderNumber || "");
    if (!/^NM\d{6}$/.test(n)) return json(res, 400, { error: "Invalid order number" });
    const snap = await db.collection("orders").where("orderNumber", "==", n).limit(1).get();
    if (snap.empty) return json(res, 404, { error: "Order not found" });
    const doc = snap.docs[0];
    // Only the customer who placed this order (or an admin) may read it.
    if (!canAccessOrder(user, doc.data())) throw forbidden();
    return json(res, 200, { order: { _id: doc.id, id: doc.id, ...doc.data() } });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
