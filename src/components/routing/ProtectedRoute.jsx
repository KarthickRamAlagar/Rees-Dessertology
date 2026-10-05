import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuthReady, selectIsAuthenticated } from "@/store/authSlice";
import Spinner from "@/components/ui/Spinner";

export default function ProtectedRoute({ children }) {
  const authReady = useSelector(selectAuthReady);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  // Wait for Firebase to restore the session before deciding — otherwise a
  // signed-in person would be bounced to /login on every page refresh.
  if (!authReady) return <Spinner className="py-24" />;

  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return children;
}
