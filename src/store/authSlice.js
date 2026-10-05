import { createSlice } from "@reduxjs/toolkit";

// Source of truth for "who is signed in". Filled by AuthProvider
// (features/auth/AuthProvider.jsx) from Firebase Auth + POST /api/auth/session.
//
// status: "loading"       — Firebase/session still resolving (authReady=false)
//         "authenticated" — signed in; user + role are set
//         "unauthenticated"
// role comes from the SERVER (ADMIN_EMAILS) — it only drives UI visibility;
// every admin API route re-checks it server-side.
const initialState = {
  user: null, // { uid, name, email, photoURL }
  role: null, // "admin" | "user" | null
  status: "loading",
  authReady: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // A Firebase user was detected; the /api/auth/session call is in flight.
    authStarted(state) {
      state.status = "loading";
      state.authReady = false;
      state.error = null;
    },
    authSucceeded(state, { payload }) {
      const { role, ...user } = payload;
      state.user = user;
      state.role = role === "admin" ? "admin" : "user";
      state.status = "authenticated";
      state.authReady = true;
      state.error = null;
    },
    authFailed(state, { payload }) {
      state.user = null;
      state.role = null;
      state.status = "unauthenticated";
      state.authReady = true;
      state.error = payload || "Sign-in failed";
    },
    signedOut(state) {
      state.user = null;
      state.role = null;
      state.status = "unauthenticated";
      state.authReady = true;
      state.error = null;
    },
  },
});

export const { authStarted, authSucceeded, authFailed, signedOut } = authSlice.actions;

export const selectAuth = (s) => s.auth;
export const selectUser = (s) => s.auth.user;
export const selectRole = (s) => s.auth.role;
export const selectAuthReady = (s) => s.auth.authReady;
export const selectIsAuthenticated = (s) => s.auth.status === "authenticated" && Boolean(s.auth.user);
export const selectIsAdmin = (s) => s.auth.role === "admin" && s.auth.status === "authenticated";

export default authSlice.reducer;
