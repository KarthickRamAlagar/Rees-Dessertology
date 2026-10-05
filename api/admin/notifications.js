import { db, json, cors, requireAdmin, requireConfig } from "../_lib.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    await requireAdmin(req);
    requireConfig();
    if (req.method === "GET") {
      const snap = await db.collection("notifications").orderBy("createdAt", "desc").get();
      const notifications = snap.docs.map((d) => {
        const data = d.data();
        return { _id: d.id, id: d.id, title: data.title, message: data.message, active: data.active, _createdAt: data.createdAt };
      });
      return json(res, 200, { notifications });
    }
    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
    const { title, message, active = true } = req.body || {};
    if (!title || !message) return json(res, 400, { error: "Title and message are required" });
    const createdAt = new Date().toISOString();
    const ref = await db.collection("notifications").add({ title, message, active: Boolean(active), createdAt });
    return json(res, 201, { notification: { id: ref.id, title, message, active: Boolean(active), _createdAt: createdAt } });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
