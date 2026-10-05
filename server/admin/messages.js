import { db, json, cors, requireAdmin, requireConfig } from "../_lib.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    await requireAdmin(req);
    requireConfig();
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
    const snap = await db.collection("contactMessages").orderBy("createdAt", "desc").get();
    const messages = snap.docs.map((d) => {
      const data = d.data();
      return { _id: d.id, id: d.id, name: data.name, email: data.email, phone: data.phone, message: data.message, _createdAt: data.createdAt };
    });
    return json(res, 200, { messages });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
