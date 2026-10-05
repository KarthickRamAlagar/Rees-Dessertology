// Tracks, per browser, which "News & Offers" notification ids the person has
// actually opened (via the account Notifications tab) — not just had a toast
// pop up for. No backend "seen" tracking needed since this is purely a local
// read-state convenience, same spirit as the rest of this app's local
// cart/wishlist handling.
const KEY = "organicDessertsSeenNotifications";

export function getSeenIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
}

export function markSeen(ids) {
  try {
    const merged = new Set([...getSeenIds(), ...ids]);
    localStorage.setItem(KEY, JSON.stringify([...merged]));
  } catch {
    // localStorage unavailable — nothing to do, just don't crash.
  }
}

export function getUnseen(notifications) {
  const seen = getSeenIds();
  return (notifications || []).filter((n) => !seen.has(n.id));
}
