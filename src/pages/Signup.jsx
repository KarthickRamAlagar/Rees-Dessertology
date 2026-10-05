import { Navigate, useLocation } from "react-router-dom";

// Accounts are created automatically on first Google sign-in, so /signup is
// just the same Google sign-in page.
export default function Signup() {
  const { search } = useLocation();
  return <Navigate to={`/login${search}`} replace />;
}
