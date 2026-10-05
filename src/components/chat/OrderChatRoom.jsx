import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Send, CheckCircle2, XCircle, QrCode, ShieldCheck, Clock, Receipt, Package, MapPin, Check, BadgeIndianRupee, User,
} from "lucide-react";

// Shared per-order payment chat — used for BOTH the customer
// (src/pages/OrderChat.jsx and the Account page's "Payment Chat" section) and
// the admin inbox (src/admin/pages/AdminChats.jsx), so both sides see the same
// interface: header (back + title + subtitle), a big scrolling message wall,
// a composer at the bottom and a right-hand panel.
//
// Payment flow (no UTR / screenshot any more):
//   1. Customer scans the QR and pays.
//   2. Customer taps "I've paid ₹X" -> ONE `payment_notice` message. The
//      server fills in the customer name, order id and amount from the order.
//   3. Admin sees a card (customer name · order id · amount) with
//      "Payment received" / "Not received". Not received lets the customer tap
//      "I've paid" again, which resets the order to pending with a new notice.
// Older "payment" (UTR/screenshot) messages are still displayed read-only.
//
// All colours are hard-coded on purpose (not the cocoa-*/cream-* theme
// tokens): those tokens flip under dark mode and the admin area has its own
// light theme. This component looks identical everywhere.
//
// Messages are polled via react-query's refetchInterval (every 4s) — every
// order read/write goes through client/api/** on the Admin SDK.
const C = {
  espresso: "#2b1a0f",
  cocoa: "#402616",
  cocoaSoft: "#6b4226",
  caramel: "#c8912e",
  caramelLight: "#d9a441",
  cream: "#fdfbf7",
  creamDeep: "#f3e9d7",
  sage: "#4f8a5b",
  berry: "#b4475a",
  muted: "#8a7358",
  line: "#eadfc9",
};

const GOLD = `linear-gradient(135deg, ${C.caramelLight}, ${C.caramel})`;
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const dayLabel = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(Date.now() - 86400000);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

// Tailwind needs literal class names, so the two panel breakpoints are spelled out.
const ASIDE = {
  lg: { aside: "hidden lg:flex", inlineOnly: "lg:hidden", mobileBar: "lg:hidden" },
  xl: { aside: "hidden xl:flex", inlineOnly: "xl:hidden", mobileBar: "xl:hidden" },
};

export default function OrderChatRoom({
  queryKey,
  fetchMessages,
  sendText,
  sendPaymentNotice,
  onConfirmPayment,
  onRejectPayment,
  onChanged,
  isAdmin = false,
  upiId = "reesdessertology@upi",
  backTo,
  backLabel = "Back",
  className = "",
  // Replaces the default right-hand panel (the admin inbox passes its own).
  // Called as renderSidePanel({ order, decide, deciding }).
  renderSidePanel,
  asideFrom = "lg",
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [goingHome, setGoingHome] = useState("");
  const wasPaid = useRef(null);
  const endRef = useRef(null);
  const bp = ASIDE[asideFrom] || ASIDE.lg;

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: fetchMessages,
    refetchInterval: 4000,
    retry: false,
  });
  const messages = data?.messages || [];
  const order = data?.order;
  const isQr = order ? order.paymentMethod === "upi" : true;
  const paid = order?.paymentStatus === "paid";
  const failed = order?.paymentStatus === "failed";
  const noticePending = !paid && !failed && (order?.paymentNotice?.status === "pending" || messages.some((m) => m.type === "payment_notice" && m.status === "pending"));
  const hasNotice = Boolean(order?.paymentNotice || order?.payment) || messages.some((m) => m.type === "payment_notice" || m.type === "payment");
  const amount = order?.total ?? 0;
  const customerName = order?.userName || order?.shippingAddress?.fullName || "Customer";

  const delivered = order?.status === "delivered";

  // Order cycle finished -> send the customer back to the landing page.
  //  - delivered: the chat has been deleted server-side, so there is nothing left to show.
  //  - payment just confirmed while the chat is open: payment is done, so go home.
  useEffect(() => {
    if (isAdmin || !order) return;
    let reason = "";
    if (delivered) reason = "Order delivered — this chat has been cleared. Taking you to the home page…";
    else if (wasPaid.current === false && paid) reason = "Payment confirmed — thank you! Taking you to the home page…";
    wasPaid.current = paid;
    if (!reason) return;
    setGoingHome(reason);
    const t = setTimeout(() => navigate("/"), 4000);
    return () => clearTimeout(t);
  }, [isAdmin, order, delivered, paid, navigate]);

  // "I've paid" was just sent (message set by noticeMutation) -> home after a short pause.
  useEffect(() => {
    if (isAdmin || !goingHome) return;
    const t = setTimeout(() => navigate("/"), 3000);
    return () => clearTimeout(t);
  }, [isAdmin, goingHome, navigate]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey });
    onChanged?.();
  };

  const textMutation = useMutation({
    mutationFn: (value) => sendText(value),
    onSuccess: () => {
      setText("");
      refresh();
    },
  });

  const noticeMutation = useMutation({
    mutationFn: () => sendPaymentNotice(),
    onSuccess: () => {
      refresh();
      // Customer's part is done — send them to the landing page. The admin
      // confirms in the background and the order stays under Account.
      if (!isAdmin) setGoingHome("Payment notice sent — we'll confirm it shortly. Taking you to the home page…");
    },
    // e.g. 409 "already told us" — pull the latest state either way.
    onError: refresh,
  });

  const decisionMutation = useMutation({
    mutationFn: ({ action, id }) => (action === "confirm" ? onConfirmPayment(id) : onRejectPayment(id)),
    onSuccess: refresh,
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    textMutation.mutate(text.trim());
  };

  const decide = (action) => decisionMutation.mutate({ action, id: order?.id });

  const statusPill = paid
    ? { label: "Payment confirmed", bg: "rgba(79,138,91,0.22)", fg: "#bfe8c8", dot: C.sage }
    : failed
      ? { label: isAdmin ? "Marked not received" : "Payment not received", bg: "rgba(180,71,90,0.25)", fg: "#ffd0d8", dot: C.berry }
      : noticePending
        ? { label: isAdmin ? "Customer says paid — please check" : "Waiting for admin to confirm", bg: "rgba(217,164,65,0.25)", fg: "#ffe3a8", dot: C.caramelLight }
        : { label: isAdmin ? "Awaiting customer payment" : "Awaiting payment", bg: "rgba(255,255,255,0.14)", fg: C.creamDeep, dot: C.creamDeep };

  const steps = [
    { label: "Scan & pay", done: hasNotice || paid },
    { label: "Tap “I've paid”", done: hasNotice || paid },
    { label: failed ? "Not received" : "Admin confirms", done: paid, bad: failed },
  ];

  const sidePanel = renderSidePanel
    ? renderSidePanel({ order, decide, deciding: decisionMutation.isPending })
    : (
      <DefaultSidePanel order={order} isAdmin={isAdmin} isQr={isQr} paid={paid} amount={amount} upiId={upiId} />
    );

  let lastDay = "";

  return (
    <div
      className={`flex overflow-hidden rounded-3xl border shadow-[0_24px_60px_-24px_rgba(43,26,15,0.45)] ${className}`}
      style={{ background: C.cream, borderColor: "#e9d8ba", color: C.espresso }}
    >
      {/* ───────────── Main chat column ───────────── */}
      <section className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header
          className="shrink-0 px-3 sm:px-6 py-3.5 sm:py-4 text-white"
          style={{ background: `linear-gradient(120deg, ${C.espresso} 0%, ${C.cocoa} 55%, ${C.cocoaSoft} 100%)` }}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            {backTo && (
              <Link
                to={backTo}
                aria-label={backLabel}
                title={backLabel}
                className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft size={18} />
              </Link>
            )}
            <div
              className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-full flex items-center justify-center shadow-inner font-semibold"
              style={{ background: GOLD }}
            >
              {isAdmin && order ? customerName.charAt(0).toUpperCase() : <ShieldCheck size={20} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight truncate">
                {isAdmin && order ? customerName : "Payment Chat"}
                {order?.orderNumber ? ` · #${order.orderNumber}` : ""}
              </p>
              <p className="text-xs text-white/70 truncate">
                {isAdmin ? "Customer ↔ Ree's Dessertology" : "You ↔ Ree's Dessertology"} · {money(amount)}
              </p>
            </div>
            <span
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium rounded-full px-3 py-1.5 shrink-0"
              style={{ background: statusPill.bg, color: statusPill.fg }}
            >
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: statusPill.dot }} />
              {statusPill.label}
            </span>
          </div>
          <span
            className="sm:hidden mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium rounded-full px-3 py-1.5"
            style={{ background: statusPill.bg, color: statusPill.fg }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: statusPill.dot }} />
            {statusPill.label}
          </span>
        </header>

        {/* Progress strip */}
        {isQr && (
          <div className="shrink-0 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 border-b overflow-x-auto" style={{ background: "#faf5ec", borderColor: C.line }}>
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2 flex-1 min-w-0 shrink-0">
                <span
                  className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ background: s.bad ? C.berry : s.done ? C.sage : "#cdb892" }}
                >
                  {s.done ? <Check size={13} /> : s.bad ? <XCircle size={13} /> : i + 1}
                </span>
                <span className="text-xs font-medium whitespace-nowrap" style={{ color: s.done ? C.cocoa : C.muted }}>{s.label}</span>
                {i < steps.length - 1 && <span className="flex-1 h-px min-w-[10px]" style={{ background: "#e0d2b6" }} />}
              </div>
            ))}
          </div>
        )}

        {/* Admin quick actions — small screens (large screens use the side panel) */}
        {isAdmin && order && !paid && (
          <div className={`${bp.mobileBar} shrink-0 flex gap-2 px-3 sm:px-6 py-2.5 border-b`} style={{ background: "#fffaf1", borderColor: C.line }}>
            <DecisionButtons onDecide={decide} deciding={decisionMutation.isPending} compact />
          </div>
        )}

        {/* Message wall */}
        <div
          className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-5 space-y-3"
          style={{
            background: "#f6ecd9",
            backgroundImage: "radial-gradient(rgba(107,66,38,0.07) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        >
          {/* QR card — customers only, below the panel breakpoint (above it, it lives in the side panel) */}
          {!isAdmin && isQr && !paid && !isLoading && !isError && (
            <div className={bp.inlineOnly}>
              <QrCard amount={amount} upiId={upiId} />
            </div>
          )}

          {isLoading && <p className="text-center text-sm py-10" style={{ color: C.muted }}>Loading chat…</p>}
          {isError && (
            <p className="text-center text-sm py-10" style={{ color: C.berry }}>
              Couldn't load this chat. It may belong to a different account.
            </p>
          )}

          {!isLoading && !isError && (
            <div className="mx-auto max-w-md text-center text-[12px] rounded-xl px-4 py-2 bg-white/70 border" style={{ color: C.muted, borderColor: C.line }}>
              {isAdmin
                  ? "When the customer taps “I've paid”, a payment card appears here. Check your bank/UPI app, then confirm."
                  : "Scan the QR code, pay the exact amount, then tap “I've paid” below. We'll confirm it shortly."}
            </div>
          )}

          {!isLoading && !isError && messages.length === 0 && !delivered && (
            <p className="text-center text-xs py-4" style={{ color: "#a08a6a" }}>No messages yet.</p>
          )}

          {messages.map((m) => {
            const label = m.createdAt ? dayLabel(m.createdAt) : "";
            const showDay = label && label !== lastDay;
            if (showDay) lastDay = label;
            return (
              <div key={m.id} className="space-y-3">
                {showDay && (
                  <div className="text-center">
                    <span className="inline-block text-[10px] uppercase tracking-wider rounded-full px-3 py-0.5 bg-white/70" style={{ color: C.muted }}>{label}</span>
                  </div>
                )}
                <MessageBubble
                  message={m}
                  mine={isAdmin ? m.sender?.kind === "admin" : m.sender?.kind === "customer"}
                  isAdmin={isAdmin}
                  orderPaid={paid}
                  onDecide={decide}
                  deciding={decisionMutation.isPending}
                />
              </div>
            );
          })}

          {paid && (
            <div className="mx-auto max-w-md rounded-2xl px-4 py-3 text-center text-sm border" style={{ background: "#eaf5ec", borderColor: "#bfe0c6", color: "#2f6a3c" }}>
              <CheckCircle2 size={20} className="inline -mt-0.5 mr-1.5" />
              Payment confirmed — thank you! {isAdmin ? "" : "We'll ask for your feedback after delivery."}
            </div>
          )}
          {failed && !isAdmin && (
            <div className="mx-auto max-w-md rounded-2xl px-4 py-3 text-center text-sm border" style={{ background: "#fbe9ec", borderColor: "#efc4cc", color: C.berry }}>
              <XCircle size={20} className="inline -mt-0.5 mr-1.5" />
              We couldn't find this payment yet. Please check, and tap “I've paid” again once it goes through.
            </div>
          )}
          {goingHome && (
            <div className="mx-auto max-w-md rounded-2xl px-4 py-3 text-center text-sm border" style={{ background: "#eaf5ec", borderColor: "#bfe0c6", color: "#2f6a3c" }}>
              <CheckCircle2 size={20} className="inline -mt-0.5 mr-1.5" />
              {goingHome} <Link to="/" className="underline font-semibold">Go now</Link>
            </div>
          )}
          {delivered && isAdmin && (
            <p className="mx-auto max-w-md text-center text-xs" style={{ color: C.muted }}>
              Order delivered — chat history was deleted to save storage.
            </p>
          )}
          <div ref={endRef} />
        </div>

        {/* Composer */}
        {delivered ? (
          <div className="shrink-0 border-t px-3 sm:px-5 py-3 text-center text-xs" style={{ background: "#fffaf1", borderColor: C.line, color: C.muted }}>
            This order is delivered — the chat is closed.
          </div>
        ) : (
        <div className="shrink-0 border-t px-3 sm:px-5 py-3" style={{ background: "#fffaf1", borderColor: C.line }}>
          {!isAdmin && isQr && !paid && !isError && (
            noticePending ? (
              <p className="w-full mb-2.5 rounded-xl py-2.5 px-3 text-sm font-medium flex items-center justify-center gap-2 border" style={{ background: "#fff6e3", borderColor: "#ecd29b", color: "#8a6a1c" }}>
                <Clock size={16} /> Notice sent — waiting for the admin to confirm
              </p>
            ) : (
              <button
                type="button"
                onClick={() => noticeMutation.mutate()}
                disabled={noticeMutation.isPending || isLoading || !order}
                className="w-full mb-2.5 rounded-xl py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2 shadow-sm hover:brightness-105 transition disabled:opacity-60"
                style={{ background: GOLD }}
              >
                <BadgeIndianRupee size={17} />
                {noticeMutation.isPending ? "Sending…" : `I've paid ${money(amount)}${failed ? " — send again" : ""}`}
              </button>
            )
          )}
          {noticeMutation.isError && (
            <p className="text-xs mb-2" style={{ color: C.berry }}>
              {noticeMutation.error?.response?.data?.error || "Couldn't send your notice — please try again."}
            </p>
          )}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isAdmin ? "Reply to customer…" : "Type a message…"}
              maxLength={1000}
              className="flex-1 min-w-0 rounded-full px-4 py-2.5 text-sm bg-white border focus:outline-none focus:ring-2"
              style={{ borderColor: "#e0d2b6", color: C.espresso, "--tw-ring-color": C.caramelLight }}
            />
            <button
              type="submit"
              disabled={textMutation.isPending || !text.trim() || !order}
              className="h-10 w-10 rounded-full text-white flex items-center justify-center disabled:opacity-50 shrink-0 shadow-sm"
              style={{ background: GOLD }}
              aria-label="Send"
            >
              <Send size={17} />
            </button>
          </form>
        </div>
        )}
      </section>

      {/* ───────────── Right-hand panel ───────────── */}
      <aside
        className={`${bp.aside} w-[320px] xl:w-[340px] shrink-0 flex-col overflow-y-auto border-l p-4 gap-4`}
        style={{ background: "#faf5ec", borderColor: C.line }}
      >
        {sidePanel}
      </aside>
    </div>
  );
}

function DecisionButtons({ onDecide, deciding, compact = false }) {
  return (
    <>
      <button
        type="button"
        onClick={() => onDecide("confirm")}
        disabled={deciding}
        className={`flex-1 rounded-lg ${compact ? "py-2" : "py-2.5"} text-sm font-semibold text-white flex items-center justify-center gap-1.5 disabled:opacity-50`}
        style={{ background: C.sage }}
      >
        <CheckCircle2 size={15} /> Payment received
      </button>
      <button
        type="button"
        onClick={() => onDecide("reject")}
        disabled={deciding}
        className={`flex-1 rounded-lg ${compact ? "py-2" : "py-2.5"} text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 border bg-white`}
        style={{ color: C.berry, borderColor: "#e8c3cb" }}
      >
        <XCircle size={15} /> Not received
      </button>
    </>
  );
}

// Default right-hand panel: QR + order summary (customer) / customer details (admin, standalone use).
function DefaultSidePanel({ order, isAdmin, isQr, paid, amount, upiId }) {
  return (
    <>
      {!isAdmin && isQr && !paid && <QrCard amount={amount} upiId={upiId} />}
      <OrderSummaryCard order={order} amount={amount} />
      {isAdmin && <CustomerCard order={order} />}
    </>
  );
}

export function OrderSummaryCard({ order, amount }) {
  return (
    <div className="rounded-2xl p-4 border bg-white" style={{ borderColor: C.line }}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5" style={{ color: C.muted }}>
        <Package size={13} /> Order summary
      </p>
      <ul className="space-y-1.5 text-sm">
        {(order?.items || []).map((it, i) => (
          <li key={i} className="flex justify-between gap-3">
            <span className="truncate">{it.productName} × {it.quantity}</span>
            <span className="shrink-0" style={{ color: C.cocoaSoft }}>{money(it.price * it.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 pt-3 border-t flex justify-between font-semibold" style={{ borderColor: C.line }}>
        <span>Total</span>
        <span>{money(amount)}</span>
      </div>
      {order?.testMode && (
        <p className="mt-2 text-[11px] rounded-md px-2 py-1" style={{ background: "#fff3d6", color: "#8a6a1c" }}>Test order (₹1 test mode)</p>
      )}
    </div>
  );
}

export function CustomerCard({ order }) {
  if (!order) return null;
  const a = order.shippingAddress;
  return (
    <div className="rounded-2xl p-4 border bg-white text-sm" style={{ borderColor: C.line }}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: C.muted }}>
        <MapPin size={13} /> Customer
      </p>
      <p className="font-medium">{order.userName || a?.fullName}</p>
      {order.userEmail && <p className="text-xs break-all" style={{ color: C.muted }}>{order.userEmail}</p>}
      {a && (
        <>
          <p style={{ color: C.cocoaSoft }}>{a.phone}</p>
          <p className="text-xs mt-1" style={{ color: C.muted }}>
            {[a.addressLine1, a.city, a.state, a.pincode].filter(Boolean).join(", ")}
          </p>
        </>
      )}
    </div>
  );
}

function QrCard({ amount, upiId }) {
  return (
    <div className="rounded-2xl p-4 border bg-white text-center" style={{ borderColor: C.line }}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center justify-center gap-1.5" style={{ color: C.muted }}>
        <QrCode size={13} /> Scan to pay
      </p>
      <div className="inline-block rounded-2xl p-2.5 border" style={{ borderColor: C.line, background: "#fff" }}>
        <img
          src="/payment-qr.png"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=Rees%20Dessertology&am=${amount}&cu=INR`)}`;
          }}
          alt="Scan to pay via UPI"
          className="block w-44 h-44 object-contain"
        />
      </div>
      <p className="mt-3 text-2xl font-bold" style={{ color: C.espresso }}>{money(amount)}</p>
      <p className="text-xs mt-1" style={{ color: C.muted }}>Open GPay, PhonePe or Paytm, pay the exact amount, then tap “I've paid” in the chat.</p>
    </div>
  );
}

function MessageBubble({ message, mine, isAdmin, orderPaid, onDecide, deciding }) {
  const time = message.createdAt ? new Date(message.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : "";
  const mineStyle = { background: GOLD, color: "#fff" };
  const theirStyle = { background: "#fff", color: C.espresso, border: `1px solid ${C.line}` };

  if (message.type === "system") {
    return (
      <div className="text-center">
        <span className="inline-block text-[11px] rounded-full px-3 py-1 bg-white/80 border" style={{ color: C.muted, borderColor: C.line }}>{message.text}</span>
      </div>
    );
  }

  if (message.type === "payment_notice") {
    const pending = !message.status || message.status === "pending";
    const confirmed = message.status === "confirmed";
    return (
      <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
        <div className="w-full max-w-[360px] rounded-2xl overflow-hidden shadow-sm border bg-white" style={{ borderColor: C.line }}>
          <div className="px-4 py-2 flex items-center gap-2 text-white text-xs font-semibold tracking-wide uppercase" style={{ background: `linear-gradient(120deg, ${C.cocoa}, ${C.cocoaSoft})` }}>
            <Receipt size={14} /> Payment notice
          </div>
          <div className="px-4 py-3" style={{ color: C.espresso }}>
            <dl className="text-sm space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide" style={{ color: C.muted }}><User size={12} /> Customer</dt>
                <dd className="font-medium text-right break-words min-w-0">{message.userName}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[11px] uppercase tracking-wide" style={{ color: C.muted }}>Order ID</dt>
                <dd className="font-mono font-semibold">#{message.orderNumber}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[11px] uppercase tracking-wide" style={{ color: C.muted }}>Amount</dt>
                <dd className="text-xl font-bold">{money(message.amount)}</dd>
              </div>
            </dl>

            {isAdmin && pending && !orderPaid && (
              <div className="flex gap-2 mt-3">
                <DecisionButtons onDecide={onDecide} deciding={deciding} compact />
              </div>
            )}

            {!isAdmin && pending && (
              <p className="mt-3 text-xs rounded-lg px-3 py-2 flex items-center gap-1.5" style={{ background: "#fff6e3", color: "#8a6a1c" }}>
                <Clock size={13} /> Sent — waiting for the admin to confirm.
              </p>
            )}

            {!pending && (
              <p
                className="mt-3 text-xs font-semibold rounded-lg px-3 py-2 flex items-center gap-1.5"
                style={confirmed ? { background: "#eaf5ec", color: "#2f6a3c" } : { background: "#fbe9ec", color: C.berry }}
              >
                {confirmed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                {confirmed ? "Payment received" : "Not received"}
              </p>
            )}
            <p className="text-[10px] mt-2 text-right" style={{ color: "#a08a6a" }}>{time}</p>
          </div>
        </div>
      </div>
    );
  }

  // Older UTR/screenshot proofs from before the "I've paid" flow — shown
  // read-only so existing threads still make sense.
  if (message.type === "payment") {
    const decided = message.status && message.status !== "pending";
    const ok = message.status === "confirmed" || message.status === "paid";
    return (
      <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
        <div className="w-full max-w-[340px] rounded-2xl overflow-hidden shadow-sm border bg-white" style={{ borderColor: C.line }}>
          <div className="px-4 py-2 flex items-center gap-2 text-white text-xs font-semibold tracking-wide uppercase" style={{ background: `linear-gradient(120deg, ${C.cocoa}, ${C.cocoaSoft})` }}>
            <Receipt size={14} /> Payment details (earlier)
          </div>
          <div className="px-4 py-3" style={{ color: C.espresso }}>
            {message.utr && (
              <>
                <p className="text-[11px] uppercase tracking-wide" style={{ color: C.muted }}>UTR / Transaction ID</p>
                <p className="font-mono text-base font-semibold break-all">{message.utr}</p>
              </>
            )}
            {message.note && <p className="text-sm mt-1.5" style={{ color: C.cocoaSoft }}>{message.note}</p>}
            {message.proofUrl && (
              <a href={message.proofUrl} target="_blank" rel="noreferrer" className="block mt-2 text-xs underline" style={{ color: C.caramel }}>
                View screenshot
              </a>
            )}
            {decided && (
              <p className="mt-3 text-xs font-semibold rounded-lg px-3 py-2 flex items-center gap-1.5" style={ok ? { background: "#eaf5ec", color: "#2f6a3c" } : { background: "#fbe9ec", color: C.berry }}>
                {ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                {ok ? "Payment received" : "Not received"}
              </p>
            )}
            <p className="text-[10px] mt-2 text-right" style={{ color: "#a08a6a" }}>{time}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] sm:max-w-[80%] px-3.5 py-2 text-sm shadow-sm ${mine ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-bl-md"}`}
        style={mine ? mineStyle : theirStyle}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <p className="text-[10px] mt-1 text-right" style={{ opacity: 0.7 }}>{time}</p>
      </div>
    </div>
  );
}
