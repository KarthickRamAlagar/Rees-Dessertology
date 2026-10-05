import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuthReady, selectIsAuthenticated, selectIsAdmin } from "@/store/authSlice";
import Spinner from "@/components/ui/Spinner";
import NotAuthorized from "@/admin/pages/NotAuthorized";

// Admin = signed in with a Google account whose email is in the server-side
// ADMIN_EMAILS list (the role comes back from POST /api/auth/session). This
// route only decides what to SHOW; every /api/admin/* function re-checks
// the token server-side in requireAdmin(), which cannot be bypassed from here.
export default function AdminProtectedRoute({ children }) {
  const authReady = useSelector(selectAuthReady);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();

  if (!authReady) return <Spinner className="py-24" />;
  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (!isAdmin) return <NotAuthorized />;
  return children;
}
