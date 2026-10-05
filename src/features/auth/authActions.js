import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { queryClient } from "@/lib/queryClient";

// Opens the Google popup. AuthProvider (onAuthStateChanged) takes it from
// there — verifies the session with the server and fills Redux.
export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

// Signs out of Firebase and drops every cached query so the next account
// never sees the previous one's orders/chats.
export async function logoutUser() {
  try {
    await signOut(auth);
  } finally {
    queryClient.clear();
  }
}
