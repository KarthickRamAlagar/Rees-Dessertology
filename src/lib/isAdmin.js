import { useSelector } from "react-redux";
import { selectIsAdmin } from "@/store/authSlice";

// "Is this person the admin" on the frontend: the role the server returned
// from POST /api/auth/session (their Google email is in ADMIN_EMAILS), held
// in Redux. This only controls what the UI shows — every /api/admin/* route
// re-checks it server-side in requireAdmin().
export function useIsAdmin() {
  return useSelector(selectIsAdmin);
}
