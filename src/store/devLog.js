// Dev-only action log for the Redux dev panel (components/dev/ReduxDevPanel.jsx).
// Lives OUTSIDE Redux state on purpose: a module-level ring buffer plus a tiny
// subscribe API (shaped for React's useSyncExternalStore).
const MAX = 50;
let seq = 0;
let entries = [];
const listeners = new Set();

export function pushAction(action) {
  seq += 1;
  entries = [...entries, { id: seq, at: Date.now(), type: action.type, payload: safeClone(action.payload) }].slice(-MAX);
  listeners.forEach((l) => l());
}

export function getActionLog() {
  return entries;
}

export function clearActionLog() {
  entries = [];
  listeners.forEach((l) => l());
}

export function subscribeActionLog(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function safeClone(value) {
  try {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  } catch {
    return "[unserializable]";
  }
}

// Redux middleware: records every dispatched action, then passes it on.
export const actionLogMiddleware = () => (next) => (action) => {
  if (action && typeof action.type === "string") pushAction(action);
  return next(action);
};
