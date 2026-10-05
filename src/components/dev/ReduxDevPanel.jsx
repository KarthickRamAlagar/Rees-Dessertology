import { useState, useSyncExternalStore } from "react";
import { useSelector } from "react-redux";
import { Database, X, ChevronRight, ChevronDown, Trash2 } from "lucide-react";
import { getActionLog, subscribeActionLog, clearActionLog } from "@/store/devLog";

// Dev-only in-page Redux inspector (mounted from main.jsx only when
// import.meta.env.DEV). A small floating button fixed at the bottom-right
// opens a compact panel with the live state tree (collapsible JSON) and the
// last ~50 dispatched actions (recorded by the logger middleware in
// store/devLog.js — a module-level ring buffer, not Redux state).
export default function ReduxDevPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("state");

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2 font-sans">
      {open && (
        <div className="w-[min(92vw,380px)] h-[min(70vh,480px)] flex flex-col rounded-2xl border border-cream-300 bg-cream-50 text-cocoa-700 shadow-[0_20px_50px_-12px_rgba(43,26,15,0.45)] overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-cream-300 bg-cream-100">
            <div className="flex items-center gap-1 text-xs">
              {["state", "actions"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-3 py-1 rounded-full font-medium capitalize transition-colors ${
                    tab === t ? "bg-caramel-500 text-white" : "text-cocoa-600 hover:bg-cream-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <span className="text-[10px] uppercase tracking-wider text-cocoa-500">Redux</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close Redux panel"
              className="h-7 w-7 rounded-full flex items-center justify-center text-cocoa-600 hover:bg-cream-200"
            >
              <X size={15} />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-auto p-3 text-[11px] leading-relaxed font-mono">
            {tab === "state" ? <StateTree /> : <ActionLog />}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle Redux dev panel"
        title="Redux dev panel"
        className="h-11 w-11 rounded-full flex items-center justify-center bg-caramel-500 text-white shadow-lg hover:bg-caramel-600 transition-colors"
      >
        <Database size={18} />
      </button>
    </div>
  );
}

function StateTree() {
  const state = useSelector((s) => s);
  return (
    <div>
      {Object.entries(state).map(([key, value]) => (
        <JsonNode key={key} name={key} value={value} depth={0} defaultOpen />
      ))}
    </div>
  );
}

function ActionLog() {
  const log = useSyncExternalStore(subscribeActionLog, getActionLog, getActionLog);
  const rows = [...log].reverse();
  return (
    <div>
      <div className="flex items-center justify-between mb-2 font-sans text-[11px] text-cocoa-500">
        <span>{log.length} action{log.length === 1 ? "" : "s"} (last 50)</span>
        <button type="button" onClick={clearActionLog} className="flex items-center gap-1 hover:text-caramel-600">
          <Trash2 size={12} /> Clear
        </button>
      </div>
      {rows.length === 0 && <p className="text-cocoa-400">Nothing dispatched yet.</p>}
      <ul className="space-y-1.5">
        {rows.map((a) => (
          <li key={a.id} className="rounded-lg border border-cream-300 bg-white/60 dark:bg-white/5 px-2 py-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-caramel-600 break-all">{a.type}</span>
              <span className="text-cocoa-400 shrink-0">{new Date(a.at).toLocaleTimeString("en-IN", { hour12: false })}</span>
            </div>
            {a.payload !== undefined && (
              <div className="mt-1">
                <JsonNode name="payload" value={a.payload} depth={0} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function JsonNode({ name, value, depth, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen && depth < 2);
  const isObj = value !== null && typeof value === "object";

  if (!isObj) {
    return (
      <div style={{ paddingLeft: depth ? 12 : 0 }} className="break-all">
        <span className="text-cocoa-500">{name}: </span>
        <Primitive value={value} />
      </div>
    );
  }

  const entries = Object.entries(value);
  const isArr = Array.isArray(value);
  return (
    <div style={{ paddingLeft: depth ? 12 : 0 }}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-0.5 text-left hover:text-caramel-600">
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className="text-cocoa-600">{name}</span>
        <span className="text-cocoa-400 ml-1">{isArr ? `[${entries.length}]` : `{${entries.length}}`}</span>
      </button>
      {open && entries.map(([k, v]) => <JsonNode key={k} name={k} value={v} depth={depth + 1} />)}
    </div>
  );
}

function Primitive({ value }) {
  if (value === null) return <span className="text-cocoa-400">null</span>;
  if (value === undefined) return <span className="text-cocoa-400">undefined</span>;
  if (typeof value === "string") return <span className="text-sage-500">"{value}"</span>;
  if (typeof value === "number") return <span className="text-caramel-600">{value}</span>;
  return <span className="text-berry-500">{String(value)}</span>;
}
