import { db, json, cors, requireConfig } from "./_lib.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public contact form submission — no admin auth required. Creates a
// contactMessage document; admin reads them via GET /api/admin/messages.
export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    requireConfig();
    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
    const { name, email, phone, message } = req.body || {};
    if (!name || !String(name).trim()) return json(res, 400, { error: "Name is required" });
    if (!email || !EMAIL_RE.test(email)) return json(res, 400, { error: "Enter a valid email address" });
    if (!message || !String(message).trim()) return json(res, 400, { error: "Message is required" });

    const now = new Date().toISOString();
    const ref = await db.collection("contactMessages").add({
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : "",
      message: String(message).trim(),
      createdAt: now,
    });
    return json(res, 201, { message: { id: ref.id, name, email, phone: phone || "", message, _createdAt: now } });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
