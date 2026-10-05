import { useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { signInWithGoogle } from "@/features/auth/authActions";
import { safeNext } from "@/features/auth/safeNext";
import { selectAuth } from "@/store/authSlice";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const { status, authReady, role, error: sessionError } = useSelector(selectAuth);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // `next` is the new param; `redirect` is accepted for any old links.
  const requested = searchParams.get("next") || searchParams.get("redirect");
  const redirectTo = safeNext(requested, role === "admin" ? "/admin" : "/account");

  if (status === "authenticated") {
    // Admins land on the dashboard unless they were heading somewhere specific.
    return <Navigate to={requested ? redirectTo : role === "admin" ? "/admin" : "/account"} replace />;
  }

  const handleGoogle = async () => {
    setBusy(true);
    setError("");
    try {
      await signInWithGoogle();
      // AuthProvider takes over (session call -> Redux) and this page
      // redirects as soon as status becomes "authenticated".
    } catch (err) {
      const code = err?.code || "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        // Person just closed the popup — not an error worth showing.
      } else if (code === "auth/popup-blocked") {
        setError("Your browser blocked the sign-in popup. Please allow popups for this site and try again.");
      } else if (code === "auth/unauthorized-domain") {
        setError("This domain isn't authorized for Google sign-in yet. Add it under Firebase Console → Authentication → Settings → Authorized domains.");
      } else if (code === "auth/operation-not-allowed") {
        setError("Google sign-in isn't enabled yet. Enable it under Firebase Console → Authentication → Sign-in method.");
      } else {
        setError(err?.message || "Couldn't sign you in — please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const resolving = !authReady || busy;

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-cocoa-800 mb-1 text-center">Welcome Back</h1>
      <p className="text-sm text-cocoa-500 mb-6 text-center">Log in to continue to your order.</p>

      <div className="glass-panel rounded-glass p-6 space-y-4">
        {(error || sessionError) && <p className="text-berry-500 text-xs text-center">{error || sessionError}</p>}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={resolving}
          className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-60"
        >
          {resolving ? <span className="h-5 w-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" /> : <span className="bg-white rounded-full h-6 w-6 flex items-center justify-center"><GoogleMark /></span>}
          {resolving ? "Please wait…" : "Continue with Google"}
        </button>
        <p className="text-[11px] text-cocoa-400 text-center">
          New here? Signing in with Google creates your account automatically.
        </p>
      </div>
    </div>
  );
}
