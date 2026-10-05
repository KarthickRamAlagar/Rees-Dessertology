import axios from "axios";
import { getIdToken } from "@/lib/firebase";

// Same-origin by default now that the API routes (client/api/**) deploy
// alongside this app. Set VITE_API_URL only for local dev against
// `vercel dev` (see client/.env.example).
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// ONE axios instance for the storefront AND the admin area (adminApi.js
// re-exports it). Waits for Firebase auth to be ready, then attaches the
// signed-in user's fresh ID token. The server decides what that user may do
// (orders they own, or admin endpoints if their email is in ADMIN_EMAILS).
export const api = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" } });
api.interceptors.request.use(async (config) => {
  try {
    const token = await getIdToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    /* token unavailable — send the request without it; the server will 401 if it needs one */
  }
  return config;
});

export function getMediaUrl(url) {
  return url || "";
}
export default api;
