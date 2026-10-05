import { db, json, cors, requireConfig } from "./_lib.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    requireConfig();
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
    const snap = await db.collection("categories").orderBy("name", "asc").get();
    const categories = snap.docs.map((d) => {
      const data = d.data();
      return { _id: d.id, id: d.id, name: data.name, slug: data.slug, image: data.image || null, imageQuery: data.imageQuery || "" };
    });
    return json(res, 200, { categories });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
