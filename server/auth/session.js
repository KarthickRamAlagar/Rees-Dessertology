import { db, json, cors, requireConfig, requireUser, isAdminUser } from "../_lib.js";

// POST /api/auth/session — called by the browser right after Google sign-in
// (and on every page load while signed in). Verifies the Firebase ID token,
// upserts users/{uid} and tells the client the user's role.
//
// role is computed here, on the server, from ADMIN_EMAILS — it is never read
// back from the stored doc, so editing a users doc can't grant admin.
export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    requireConfig();
    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
    const auth = await requireUser(req);

    const role = isAdminUser(auth) ? "admin" : "user";
    const now = new Date().toISOString();
    const ref = db.collection("users").doc(auth.uid);
    const snap = await ref.get();
    const existing = snap.exists ? snap.data() : null;

    const patch = {
      uid: auth.uid,
      name: auth.name || (auth.email ? auth.email.split("@")[0] : "Customer"),
      email: auth.email,
      photoURL: auth.picture || "",
      role,
      lastLoginAt: now,
    };
    // Set once. orderNumbers is only initialised here and otherwise
    // maintained by arrayUnion in POST /api/orders — never overwritten.
    if (!existing?.createdAt) patch.createdAt = now;
    if (!existing || !Array.isArray(existing.orderNumbers)) patch.orderNumbers = existing?.orderNumbers || [];

    await ref.set(patch, { merge: true });
    const saved = (await ref.get()).data();
    return json(res, 200, { user: saved, role });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
