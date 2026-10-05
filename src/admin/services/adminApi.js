// Admin requests use the same axios instance as the storefront: it attaches
// the signed-in user's Firebase ID token, and the server's requireAdmin()
// (client/api/_lib.js) only lets through emails listed in ADMIN_EMAILS.
import api from "@/services/api";

export const adminApi = api;
export default api;
