import { db, json, cors, requireConfig } from "./_lib.js";

// Public — the "News & Offers" messages a customer sees in their account
// Notifications tab and in the toast. Only active ones, newest first.
export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    requireConfig();
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
    // No orderBy in the query: combining where() with orderBy() on a different
    // field needs a hand-made Firestore composite index (otherwise a 500
    // FAILED_PRECONDITION). The data sets here are small, so sort in memory.
    const snap = await db.collection("notifications").where("active", "==", true).get();
    const docs = snap.docs.slice().sort((a, b) => String(b.data().createdAt || "").localeCompare(String(a.data().createdAt || "")));
    const notifications = docs.map((d) => {
      const data = d.data();
      return { _id: d.id, id: d.id, title: data.title, message: data.message, _createdAt: data.createdAt };
    });
    return json(res, 200, { notifications });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
