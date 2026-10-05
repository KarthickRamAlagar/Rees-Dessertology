import { useSelector } from "react-redux";
import { selectUser, selectRole, selectIsAuthenticated } from "@/store/authSlice";
import { logoutUser } from "./authActions";

// Thin compatibility wrappers over Redux + Firebase so older components
// (Navbar, Account sidebar, Newsletter…) keep working unchanged. The source
// of truth is the Redux auth slice (store/authSlice.js) — there is no local
// store or localStorage-backed "mock login" anymore.
//
//   useAuthStore()                  -> { user, role, logout }
//   useAuthStore((s) => s.user)     -> selector form, same as before
export function useAuthStore(selector) {
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const state = { user, role, logout: logoutUser };
  return selector ? selector(state) : state;
}

export const useIsAuthenticated = () => useSelector(selectIsAuthenticated);
