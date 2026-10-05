import { db, json, cors, requireAdmin, requireConfig } from "../_lib.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    await requireAdmin(req);
    requireConfig();
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
    const status = req.query?.status;
    let q = db.collection("orders");
    if (status) q = q.where("status", "==", status);
    // Sort in memory — where(status) + orderBy(createdAt) would need a composite index.
    const snap = await q.get();
    const orders = snap.docs
      .map((d) => ({ _id: d.id, id: d.id, ...d.data() }))
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    return json(res, 200, { orders });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
