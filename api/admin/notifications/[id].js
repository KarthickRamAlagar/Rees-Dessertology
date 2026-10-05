import { db, json, cors, requireAdmin, requireConfig } from "../../_lib.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    await requireAdmin(req);
    requireConfig();
    const id = req.query.id;
    const ref = db.collection("notifications").doc(id);

    if (req.method === "PUT") {
      const { title, message, active } = req.body || {};
      const patch = {};
      if (title != null) patch.title = title;
      if (message != null) patch.message = message;
      if (active != null) patch.active = Boolean(active);
      await ref.update(patch);
      const updated = await ref.get();
      return json(res, 200, { notification: { id: updated.id, ...updated.data() } });
    }

    if (req.method === "DELETE") {
      await ref.delete();
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
