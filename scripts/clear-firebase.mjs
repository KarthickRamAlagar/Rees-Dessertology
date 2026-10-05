// WIPES Firestore (and optionally Firebase Auth users) so you can start the
// client demo from a clean slate, then re-run the seed script.
//
//   node --env-file=.env scripts/clear-firebase.mjs --yes            # all Firestore data
//   node --env-file=.env scripts/clear-firebase.mjs --yes --auth     # + all Firebase Auth users
//   node --env-file=.env scripts/clear-firebase.mjs --yes --keep-catalog   # keep products & categories
//
// Run from the client/ folder. Without --yes it only lists what it WOULD delete.
// After it finishes:  node --env-file=.env scripts/seed-firebase.mjs
import admin from "firebase-admin";
import { readFileSync } from "node:fs";

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) return JSON.parse(readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8"));
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return { projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") };
  }
  throw new Error("Missing Firebase admin credentials — set FIREBASE_SERVICE_ACCOUNT_PATH (or JSON / split vars) in .env.");
}

const args = new Set(process.argv.slice(2));
const confirmed = args.has("--yes");
const wipeAuth = args.has("--auth");
const keepCatalog = args.has("--keep-catalog");

const sa = loadServiceAccount();
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

console.log(`Project: ${sa.project_id || sa.projectId}`);
let collections = await db.listCollections();
if (keepCatalog) collections = collections.filter((c) => !["products", "categories"].includes(c.id));

for (const col of collections) {
  const count = (await col.count().get()).data().count;
  console.log(`  ${confirmed ? "deleting" : "would delete"} ${col.id} (${count} docs, incl. sub-collections like chat messages)`);
  // recursiveDelete also removes sub-collections (orders/{id}/messages).
  if (confirmed) await db.recursiveDelete(col);
}

if (wipeAuth) {
  let total = 0, token;
  do {
    const page = await admin.auth().listUsers(1000, token);
    const uids = page.users.map((u) => u.uid);
    total += uids.length;
    if (confirmed && uids.length) await admin.auth().deleteUsers(uids);
    token = page.pageToken;
  } while (token);
  console.log(`  ${confirmed ? "deleted" : "would delete"} ${total} Firebase Auth users`);
}

console.log(confirmed ? "\nDone. Now run: node --env-file=.env scripts/seed-firebase.mjs" : "\nDry run only — add --yes to actually delete.");
process.exit(0);
