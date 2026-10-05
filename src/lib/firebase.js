import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

// Client-side Firebase init. Used ONLY for Authentication (Google sign-in) —
// every data read/write goes through client/api/** on the Admin SDK, with the
// signed-in user's Firebase ID token attached as `Authorization: Bearer ...`
// (see services/api.js). Uses this project's own VITE_FIREBASE_* env var
// names (see client/.env.example).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

export const googleProvider = new GoogleAuthProvider();
// Always show the account chooser so people can switch Google accounts.
googleProvider.setCustomParameters({ prompt: "select_account" });

// Resolves once Firebase has restored (or ruled out) a persisted session.
// The axios interceptor awaits this so the very first API calls on a page
// load don't go out before the user's token is available.
export const authReady = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, () => {
    unsubscribe();
    resolve();
  });
});

// Fresh ID token for the current user (the SDK refreshes it when it's close
// to expiring), or null when signed out.
export async function getIdToken() {
  await authReady;
  const user = auth.currentUser;
  return user ? user.getIdToken() : null;
}
