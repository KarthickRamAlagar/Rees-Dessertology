import admin from "firebase-admin";
import { IncomingForm } from "formidable";
import fs from "node:fs/promises";
import { readFileSync } from "node:fs";

// --- Firebase Admin SDK init -----------------------------------------
// Service-account credentials come from any ONE of three places, checked
// in this order, so pick whichever convention fits:
//   1. FIREBASE_SERVICE_ACCOUNT_PATH — a filesystem path to the downloaded
//      service-account JSON key file (e.g. D:\keys\rees-dessertology\serviceAccountKey.json
//      on Windows, or /home/you/keys/... on Linux/Mac). Nothing but the path
//      goes in .env — the key file itself stays outside the repo.
//   2. FIREBASE_SERVICE_ACCOUNT_JSON — the whole key file's contents pasted
//      in as one single-line JSON string.
//   3. FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY —
//      the same three fields pulled out of that JSON file individually.
// Never log/commit the actual values, or the key file itself.
function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      const raw = readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8");
      return JSON.parse(raw);
    } catch (e) {
      console.error(`Could not read FIREBASE_SERVICE_ACCOUNT_PATH (${process.env.FIREBASE_SERVICE_ACCOUNT_PATH}): ${e.message}`);
      return null;
    }
  }
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch {
      return null;
    }
  }
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Private keys are often stored with literal "\n" escape sequences in
      // env vars (can't contain real newlines in most .env formats) — turn
      // them back into real newlines.
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }
  return null;
}

const serviceAccount = loadServiceAccount();

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
  });
}

export const db = admin.apps.length ? admin.firestore() : null;
export const bucket = admin.apps.length && process.env.FIREBASE_STORAGE_BUCKET ? admin.storage().bucket() : null;
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;

export function json(res, status, body) {
  const origin = process.env.CLIENT_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Vary", "Origin");
  res.status(status).setHeader("Content-Type", "application/json").json(body);
}

export function cors(req, res) {
  if (req.method === "OPTIONS") {
    const origin = process.env.CLIENT_ORIGIN || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
    res.status(204).end();
    return true;
  }
  return false;
}

export function requireConfig() {
  if (!db) {
    throw Object.assign(new Error("Firebase server credentials are not configured."), { statusCode: 500 });
  }
}

// --- Firebase Auth (Google sign-in) ------------------------------------
// The browser signs in with Google through the Firebase client SDK and sends
// the resulting Firebase ID token on every API call as
// `Authorization: Bearer <token>`. These helpers verify that token with the
// Admin SDK. Admin = a verified token whose email is in ADMIN_EMAILS
// (comma-separated, case-insensitive, server-side only).
function adminEmails() {
  return String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email) {
  return Boolean(email) && adminEmails().includes(String(email).trim().toLowerCase());
}

// Returns { uid, email, name, picture } for a valid Bearer token, else null.
export async function verifyAuth(req) {
  const h = req.headers?.authorization || "";
  if (!h.startsWith("Bearer ")) return null;
  const token = h.slice(7).trim();
  if (!token) return null;
  if (!admin.apps.length) {
    throw Object.assign(new Error("Firebase server credentials are not configured."), { statusCode: 500 });
  }
  try {
    const d = await admin.auth().verifyIdToken(token);
    return {
      uid: d.uid,
      email: d.email || "",
      name: d.name || "",
      picture: d.picture || "",
      emailVerified: d.email_verified === true,
    };
  } catch {
    return null;
  }
}

export async function requireUser(req) {
  const user = await verifyAuth(req);
  if (!user) throw Object.assign(new Error("Please sign in to continue."), { statusCode: 401 });
  return user;
}

export async function requireAdmin(req) {
  const user = await requireUser(req);
  if (!adminEmails().length) {
    throw Object.assign(new Error("ADMIN_EMAILS is not configured on the server."), { statusCode: 403 });
  }
  if (!user.emailVerified || !isAdminEmail(user.email)) {
    throw Object.assign(new Error("This Google account is not authorized as admin."), { statusCode: 403 });
  }
  return user;
}

export function isAdminUser(user) {
  return Boolean(user) && user.emailVerified !== false && isAdminEmail(user.email);
}

// Owner-or-admin check for customer-facing order endpoints. Legacy orders
// created before sign-in existed have no userId, so only admins can reach them.
export function canAccessOrder(user, order) {
  if (!user || !order) return false;
  if (isAdminUser(user)) return true;
  return Boolean(order.userId) && order.userId === user.uid;
}

export function forbidden(message = "You don't have access to this order.") {
  return Object.assign(new Error(message), { statusCode: 403 });
}

export function parseMultipart(req) {
  const form = new IncomingForm({ maxFileSize: 4 * 1024 * 1024, multiples: false });
  return new Promise((resolve, reject) => form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files }))));
}

// Uploads a local (formidable temp) file to Firebase Storage and returns its
// public download URL — the Firestore-era replacement for Sanity's
// asset-reference objects. Product/category `images` fields now store
// plain URL strings instead of {_type:"image",asset:{...}} objects.
export async function uploadFile(file) {
  if (!file || !bucket) return null;
  const f = Array.isArray(file) ? file[0] : file;
  if (!f?.filepath) return null;
  const buffer = await fs.readFile(f.filepath);
  const destPath = `uploads/${Date.now()}-${(f.originalFilename || "upload.jpg").replace(/[^a-zA-Z0-9.\-_]/g, "-")}`;
  const blob = bucket.file(destPath);
  await blob.save(buffer, { contentType: f.mimetype || "image/jpeg", public: true });
  return { url: `https://storage.googleapis.com/${bucket.name}/${destPath}`, path: destPath };
}

export async function uploadUnsplash(query) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key || !query) return null;
  const r = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=squarish`, { headers: { Authorization: `Client-ID ${key}` } });
  if (!r.ok) return null;
  const data = await r.json();
  const photo = data.results?.[0];
  if (!photo?.urls?.regular) return null;
  if (!bucket) return { url: photo.urls.regular };
  const image = await fetch(photo.urls.regular);
  if (!image.ok) return { url: photo.urls.regular };
  const buffer = Buffer.from(await image.arrayBuffer());
  const destPath = `uploads/unsplash-${Date.now()}.jpg`;
  const blob = bucket.file(destPath);
  await blob.save(buffer, { contentType: image.headers.get("content-type") || "image/jpeg", public: true });
  return { url: `https://storage.googleapis.com/${bucket.name}/${destPath}`, path: destPath };
}

export function slugify(v) {
  return String(v || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Deletes every message in an order's chat thread (orders/{id}/messages).
// Called once an order is delivered so finished chats don't pile up in
// Firestore. Batches of 400 stay under Firestore's 500-writes-per-batch cap.
export async function deleteChat(orderRef) {
  const col = orderRef.collection("messages");
  for (;;) {
    const snap = await col.limit(400).get();
    if (snap.empty) return;
    const batch = orderRef.firestore.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    if (snap.size < 400) return;
  }
}
