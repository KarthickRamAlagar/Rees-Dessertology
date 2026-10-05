import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import api from "@/services/api";
import { queryClient } from "@/lib/queryClient";
import { authStarted, authSucceeded, authFailed, signedOut } from "@/store/authSlice";

// Bootstraps auth: subscribes to Firebase's onAuthStateChanged and, for a
// signed-in user, calls POST /api/auth/session (verifies the ID token, upserts
// users/{uid}, returns the server-computed role) before telling Redux the
// user is ready. Renders nothing itself.
export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const lastUid = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        if (lastUid.current) queryClient.clear();
        lastUid.current = null;
        dispatch(signedOut());
        return;
      }
      // A different account than before — never show the old one's cache.
      if (lastUid.current && lastUid.current !== fbUser.uid) queryClient.clear();
      lastUid.current = fbUser.uid;

      dispatch(authStarted());
      try {
        const { data } = await api.post("/api/auth/session");
        if (cancelled) return;
        const u = data.user || {};
        dispatch(
          authSucceeded({
            uid: fbUser.uid,
            name: u.name || fbUser.displayName || fbUser.email?.split("@")[0] || "Customer",
            email: u.email || fbUser.email || "",
            photoURL: u.photoURL || fbUser.photoURL || "",
            role: data.role,
          })
        );
      } catch (err) {
        if (cancelled) return;
        // The server rejected/failed the session (bad config, network…).
        // Treat as signed out in the UI so nothing half-works.
        dispatch(authFailed(err?.response?.data?.error || err?.message || "Could not start your session."));
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [dispatch]);

  return children;
}
