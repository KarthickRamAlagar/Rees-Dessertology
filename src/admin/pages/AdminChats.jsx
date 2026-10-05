import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { Search, CheckCircle2, XCircle, MessagesSquare, ArrowRight } from "lucide-react";
import OrderChatRoom, { OrderSummaryCard, CustomerCard } from "@/components/chat/OrderChatRoom";
import { fetchOrders } from "@/admin/services/adminOrders";
import { fetchOrderMessages, sendTextMessage, confirmPayment, rejectPayment } from "@/admin/services/adminChat";
import { selectOrder, setInboxFilter, selectInboxFilter } from "@/store/chatUiSlice";

// Admin "Payment Chats" inbox:
//   /admin/chats        -> list of QR/UPI orders (right-hand panel), no chat open
//   /admin/chats/:id    -> that order's chat in the main area
//   /admin/orders/:id/chat -> same component (kept so old links still work)
// Hard-coded warm colours like OrderChatRoom, so it looks the same everywhere.
const C = { espresso: "#2b1a0f", cocoa: "#402616", muted: "#8a7358", line: "#eadfc9", sage: "#4f8a5b", berry: "#b4475a", caramel: "#c8912e" };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
  { key: "failed", label: "Not received" },
];

const BADGE = {
  pending: { label: "Pending", bg: "#fff3d6", fg: "#8a6a1c" },
  paid: { label: "Paid", bg: "#eaf5ec", fg: "#2f6a3c" },
  failed: { label: "Not received", bg: "#fbe9ec", fg: "#b4475a" },
  refunded: { label: "Refunded", bg: "#ece8e1", fg: "#6b5b45" },
};

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const nameOf = (o) => o.userName || o.shippingAddress?.fullName || "Customer";
const hasOpenNotice = (o) => o.paymentStatus === "pending" && o.paymentNotice?.status === "pending";
const CHAT_HEIGHT = "h-[calc(100vh-11rem)] min-h-[560px]";

export default function AdminChats() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const filter = useSelector(selectInboxFilter);

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["orders", ""],
    queryFn: () => fetchOrders(),
    refetchInterval: 10000,
  });

  useEffect(() => {
    dispatch(selectOrder(id || null));
  }, [id, dispatch]);

  const qrOrders = useMemo(
    () =>
      (orders || [])
        .filter((o) => o.paymentMethod === "upi")
        // Orders with a waiting "I've paid" notice float to the top.
        .sort((a, b) => Number(hasOpenNotice(b)) - Number(hasOpenNotice(a))),
    [orders]
  );

  const panelProps = { orders: qrOrders, isLoading, isError, filter, onFilter: (f) => dispatch(setInboxFilter(f)), selectedId: id };

  if (!id) {
    return (
      <div className={`flex overflow-hidden rounded-3xl border shadow-[0_24px_60px_-24px_rgba(43,26,15,0.45)] ${CHAT_HEIGHT}`} style={{ background: "#fdfbf7", borderColor: "#e9d8ba", color: C.espresso }}>
        <section className="hidden lg:flex flex-1 min-w-0 flex-col items-center justify-center text-center p-8" style={{ background: "#f6ecd9" }}>
          <div className="h-16 w-16 rounded-full flex items-center justify-center text-white mb-4" style={{ background: `linear-gradient(135deg, #d9a441, ${C.caramel})` }}>
            <MessagesSquare size={28} />
          </div>
          <p className="text-lg font-semibold">Select a payment chat</p>
          <p className="text-sm mt-1 max-w-xs" style={{ color: C.muted }}>
            Pick an order from the list to see the customer's payment notice and confirm it.
          </p>
        </section>
        <aside className="flex w-full lg:w-[340px] shrink-0 flex-col overflow-y-auto lg:border-l p-4 gap-4" style={{ background: "#faf5ec", borderColor: C.line }}>
          <Inbox {...panelProps} />
        </aside>
      </div>
    );
  }

  return (
    <OrderChatRoom
      key={id}
      isAdmin
      className={CHAT_HEIGHT}
      queryKey={["admin-order-chat", id]}
      fetchMessages={() => fetchOrderMessages(id)}
      sendText={(text) => sendTextMessage(id, text)}
      onConfirmPayment={confirmPayment}
      onRejectPayment={rejectPayment}
      onChanged={() => queryClient.invalidateQueries({ queryKey: ["orders"] })}
      backTo="/admin/chats"
      backLabel="All payment chats"
      renderSidePanel={({ order, decide, deciding }) => (
        <>
          <SelectedOrder order={order} decide={decide} deciding={deciding} />
          <Inbox {...panelProps} />
        </>
      )}
    />
  );
}

function PayBadge({ status }) {
  const b = BADGE[status] || BADGE.pending;
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap" style={{ background: b.bg, color: b.fg }}>
      {b.label}
    </span>
  );
}

// Actions for the open order — usable without waiting for a customer notice.
function SelectedOrder({ order, decide, deciding }) {
  if (!order) return null;
  return (
    <div className="rounded-2xl p-4 border bg-white" style={{ borderColor: C.line }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>This order</p>
          <p className="font-semibold truncate">{nameOf(order)}</p>
          <p className="text-xs" style={{ color: C.muted }}>#{order.orderNumber} · {money(order.total)}</p>
        </div>
        <PayBadge status={order.paymentStatus} />
      </div>
      {order.paymentStatus !== "paid" ? (
        <>
          <p className="text-xs mt-3 mb-2" style={{ color: C.cocoa }}>
            Check your bank/UPI app for {money(order.total)}, then decide. You don't have to wait for the customer's notice.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => decide("confirm")}
              disabled={deciding}
              className="flex-1 rounded-lg py-2 text-xs font-semibold text-white flex items-center justify-center gap-1 disabled:opacity-50"
              style={{ background: C.sage }}
            >
              <CheckCircle2 size={14} /> Payment received
            </button>
            <button
              type="button"
              onClick={() => decide("reject")}
              disabled={deciding}
              className="flex-1 rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50 border bg-white"
              style={{ color: C.berry, borderColor: "#e8c3cb" }}
            >
              <XCircle size={14} /> Not received
            </button>
          </div>
        </>
      ) : (
        <p className="text-xs mt-3 rounded-lg px-3 py-2" style={{ background: "#eaf5ec", color: "#2f6a3c" }}>Payment confirmed for this order.</p>
      )}
      <details className="mt-3 group">
        <summary className="cursor-pointer text-xs font-medium select-none" style={{ color: C.caramel }}>Order & customer details</summary>
        <div className="mt-3 space-y-3">
          <OrderSummaryCard order={order} amount={order.total} />
          <CustomerCard order={order} />
        </div>
      </details>
    </div>
  );
}

function Inbox({ orders, isLoading, isError, filter, onFilter, selectedId }) {
  const [q, setQ] = useState("");
  const counts = useMemo(() => {
    const c = { all: orders.length, pending: 0, paid: 0, failed: 0 };
    for (const o of orders) if (c[o.paymentStatus] != null) c[o.paymentStatus] += 1;
    return c;
  }, [orders]);

  const shown = orders.filter((o) => {
    if (filter !== "all" && o.paymentStatus !== filter) return false;
    const needle = q.trim().toLowerCase();
    return !needle || `${nameOf(o)} ${o.orderNumber}`.toLowerCase().includes(needle);
  });

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1.5" style={{ color: C.muted }}>
          <MessagesSquare size={13} /> Payment chats
        </p>
        <span className="text-[11px]" style={{ color: C.muted }}>{counts.all} QR/UPI order{counts.all === 1 ? "" : "s"}</span>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or order #"
          className="w-full rounded-full pl-9 pr-3 py-2 text-sm bg-white border focus:outline-none focus:ring-2"
          style={{ borderColor: "#e0d2b6", color: C.espresso, "--tw-ring-color": "#d9a441" }}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => onFilter(f.key)}
              className="rounded-full px-3 py-1 text-xs font-medium border transition-colors"
              style={active ? { background: C.cocoa, color: "#fff", borderColor: C.cocoa } : { background: "#fff", color: C.cocoa, borderColor: "#e0d2b6" }}
            >
              {f.label} <span style={{ opacity: 0.7 }}>{counts[f.key]}</span>
            </button>
          );
        })}
      </div>

      {isLoading && <p className="text-sm py-4 text-center" style={{ color: C.muted }}>Loading chats…</p>}
      {isError && <p className="text-sm py-4 text-center" style={{ color: C.berry }}>Could not load orders.</p>}
      {!isLoading && !isError && shown.length === 0 && (
        <p className="text-sm py-4 text-center" style={{ color: C.muted }}>No chats match.</p>
      )}

      <ul className="space-y-2">
        {shown.map((o) => {
          const active = o.id === selectedId;
          return (
            <li key={o.id}>
              <Link
                to={`/admin/chats/${o.id}`}
                className="block rounded-xl border p-3 transition-shadow hover:shadow-md bg-white"
                style={{ borderColor: active ? C.caramel : C.line, boxShadow: active ? `0 0 0 1px ${C.caramel}` : undefined }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm truncate flex items-center gap-1.5">
                    {hasOpenNotice(o) && <span className="h-2 w-2 rounded-full shrink-0 animate-pulse" style={{ background: C.caramel }} title="Customer says they've paid" />}
                    {nameOf(o)}
                  </p>
                  <PayBadge status={o.paymentStatus} />
                </div>
                <div className="flex items-center justify-between mt-1 text-xs" style={{ color: C.muted }}>
                  <span>#{o.orderNumber}</span>
                  <span className="font-semibold" style={{ color: C.espresso }}>{money(o.total)}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link to="/admin/orders" className="text-xs font-medium inline-flex items-center gap-1 self-start hover:underline" style={{ color: C.caramel }}>
        Open full orders table <ArrowRight size={12} />
      </Link>
    </div>
  );
}
