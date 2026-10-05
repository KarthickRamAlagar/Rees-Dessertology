// Only allow same-site relative paths as a post-login destination
// (prevents an open redirect via /login?next=https://evil.example).
export function safeNext(value, fallback = "/account") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
