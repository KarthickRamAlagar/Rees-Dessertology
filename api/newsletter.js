import { db, json, cors, requireConfig } from "./_lib.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    requireConfig();

    if (req.method === "GET") {
      // Lets the landing-page newsletter card skip the form for a signed-in
      // user whose email is already subscribed (checkout flow only — the
      // footer's own newsletter form is unaffected and never calls this).
      const email = String(req.query?.email || "").toLowerCase().trim();
      if (!email || !EMAIL_RE.test(email)) return json(res, 400, { error: "Enter a valid email address" });
      const id = "newsletter." + Buffer.from(email).toString("hex");
      const doc = await db.collection("newsletterSubscribers").doc(id).get();
      return json(res, 200, { subscribed: doc.exists });
    }

    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
    const { email } = req.body || {};
    if (!email || !EMAIL_RE.test(email)) return json(res, 400, { error: "Enter a valid email address" });

    // Deterministic id from the email so re-subscribing never creates a
    // duplicate document — just confirms the existing one.
    const normalized = email.toLowerCase().trim();
    const id = "newsletter." + Buffer.from(normalized).toString("hex");
    const ref = db.collection("newsletterSubscribers").doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      await ref.set({ email: normalized, subscribedAt: new Date().toISOString() });
    }
    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
