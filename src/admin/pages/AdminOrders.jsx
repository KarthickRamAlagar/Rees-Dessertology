import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { AlertTriangle, X, MessageCircle } from "lucide-react";
import { fetchOrders, updateOrderStatus } from "@/admin/services/adminOrders";
import Pagination from "@/admin/components/Pagination";

const PAGE_SIZE = 7;

const STATUSES = ["placed", "packed", "shipped", "outForDelivery", "delivered", "cancelled"];
// Forward-only sequence — same order as the status enum, minus "cancelled"
// which is handled separately below (always selectable).
const FORWARD_ORDER = ["placed", "packed", "shipped", "outForDelivery", "delivered"];
const STATUS_LABELS = {
  placed: "Placed", packed: "Packed", shipped: "Shipped",
  outForDelivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled",
};
const STATUS_COLORS = {
  placed: "bg-ink-100 text-ink-700",
  packed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  outForDelivery: "bg-amber-100 text-amber-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const dayKey = (iso) => (iso || "").slice(0, 10);
const todayKey = () => new Date().toISOString().slice(0, 10);

// Prompts the admin for vendor/courier + support details the one time an
// order moves to "shipped" — these get shown to the customer on their
// tracking page from that point on.
function ShippingDetailsModal({ order, onCancel, onConfirm, isPending }) {
  const [vendorName, setVendorName] = useState(order.shippingDetails?.vendorName || "");
  const [vendorContact, setVendorContact] = useState(order.shippingDetails?.vendorContact || "");
  const [supportEmail, setSupportEmail] = useState(order.shippingDetails?.supportEmail || "");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ink-800">Shipping Details — #{order.orderNumber}</h2>
          <button onClick={onCancel} className="text-ink-400 hover:text-ink-700"><X size={18} /></button>
        </div>
        <p className="text-sm text-ink-400 mb-4">
          Shown to the customer on their tracking page once this order is marked Shipped.
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-ink-700 mb-1 block">Vendor / Courier Name</label>
            <input value={vendorName} onChange={(e) => setVendorName(e.target.value)} className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm" placeholder="BlueDart Express" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 mb-1 block">Vendor Contact Number</label>
            <input value={vendorContact} onChange={(e) => setVendorContact(e.target.value)} className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 mb-1 block">Customer Support Email</label>
            <input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm" placeholder="support@reesdessertology.in" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="btn-outline flex-1">Cancel</button>
          <button
            onClick={() => onConfirm({ vendorName, vendorContact, supportEmail })}
            disabled={isPending}
            className="btn-accent flex-1 disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Mark as Shipped"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pendingShipOrder, setPendingShipOrder] = useState(null);
  const queryClient = useQueryClient();
  const queryKey = ["orders", filter];

  const { data: orders, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => fetchOrders({ status: filter || undefined }),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status, shippingDetails }) => updateOrderStatus(id, status, shippingDetails),

    // Optimistic update: flip the dropdown/pill immediately instead of
    // waiting on the round-trip, and roll back cleanly if it fails.
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) =>
        old?.map((o) => (o.id === id ? { ...o, status } : o))
      );
      return { previous };
    },

    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      console.error("Failed to update order status:", error);
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const handleStatusChange = (order, newStatus) => {
    if (newStatus === "shipped" && order.status !== "shipped") {
      setPendingShipOrder(order);
      return;
    }
    mutation.mutate({ id: order.id, status: newStatus });
  };

  const confirmShipped = (shippingDetails) => {
    mutation.mutate(
      { id: pendingShipOrder.id, status: "shipped", shippingDetails },
      { onSuccess: () => setPendingShipOrder(null) }
    );
  };

  // Per-day Placed/Packed/Shipped breakdown, plus orders still "placed" from
  // a previous calendar day (those need following up on).
  const { dailyRows, overduePending } = useMemo(() => {
    const byDate = {};
    const today = todayKey();
    const overdue = [];
    for (const o of orders || []) {
      const date = dayKey(o.createdAt);
      if (!date) continue;
      if (!byDate[date]) byDate[date] = { date, placed: 0, packed: 0, shipped: 0 };
      if (o.status === "placed") byDate[date].placed += 1;
      if (o.status === "packed") byDate[date].packed += 1;
      if (o.status === "shipped") byDate[date].shipped += 1;
      if (o.status === "placed" && date !== today) overdue.push(o);
    }
    const rows = Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
    return { dailyRows: rows, overduePending: overdue };
  }, [orders]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink-800">Orders</h1>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="border border-ink-200 rounded-lg px-4 py-2 text-sm bg-white"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {overduePending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {overduePending.length} order{overduePending.length > 1 ? "s" : ""} pending from before today
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Still "Placed" from an earlier day — #{overduePending.map((o) => o.orderNumber).join(", #")}
            </p>
          </div>
        </div>
      )}

      {dailyRows.length > 0 && (
        <div className="card mb-6 overflow-x-auto">
          <p className="text-sm font-semibold text-ink-800 mb-3">Daily Status Breakdown</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-400 border-b border-ink-100">
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Placed</th>
                <th className="py-2 pr-4 font-medium">Packed</th>
                <th className="py-2 pr-4 font-medium">Shipped</th>
              </tr>
            </thead>
            <tbody>
              {dailyRows.map((row) => (
                <tr key={row.date} className="border-b border-ink-100 last:border-0">
                  <td className="py-2 pr-4 text-ink-700">
                    {new Date(row.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    {row.date === todayKey() && <span className="text-xs text-accent-600 ml-1.5">(Today)</span>}
                  </td>
                  <td className="py-2 pr-4 text-ink-600">{row.placed}</td>
                  <td className="py-2 pr-4 text-ink-600">{row.packed}</td>
                  <td className="py-2 pr-4 text-ink-600">{row.shipped}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isError && (
        <p className="text-danger-500 text-sm mb-4">
          Could not load orders — make sure you're signed in with a Google account listed in ADMIN_EMAILS.
        </p>
      )}
      {mutation.isError && (
        <p className="text-danger-500 text-sm mb-4">
          Could not update that order's status: {mutation.error?.response?.data?.error || mutation.error?.message || "unknown error"} — open the browser console / Network tab for the full response.
        </p>
      )}
      {isLoading && <p className="text-sm text-ink-400">Loading orders…</p>}

      {!isLoading && orders?.length === 0 && (
        <p className="text-sm text-ink-400">No orders yet.</p>
      )}

      <div className="space-y-3">
        {orders?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((order) => (
          <div key={order.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-ink-800">#{order.orderNumber}</p>
                <p className="text-sm font-medium text-ink-700">
                  {order.userName || order.shippingAddress?.fullName || "Customer"}
                  {order.userEmail && <span className="text-xs font-normal text-ink-400"> · {order.userEmail}</span>}
                </p>
                <p className="text-xs text-ink-400">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}₹{order.total}
                </p>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>

            <div className="text-sm text-ink-600 mb-3">
              {order.items?.map((i) => `${i.productName || i.product?.name} × ${i.quantity}`).join(", ")}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-ink-400">Update status:</span>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order, e.target.value)}
                disabled={mutation.isPending}
                className="border border-ink-200 rounded-lg px-3 py-1.5 text-sm bg-white"
              >
                {STATUSES.map((s) => {
                  // Disable any status earlier in the forward sequence than
                  // the order's current status — once packed, Placed is
                  // disabled; once shipped, Placed+Packed are disabled; etc.
                  // "cancelled" stays selectable from any non-terminal status.
                  const fromIdx = FORWARD_ORDER.indexOf(order.status);
                  const toIdx = FORWARD_ORDER.indexOf(s);
                  const disabled = s !== "cancelled" && fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx;
                  return (
                    <option key={s} value={s} disabled={disabled}>{STATUS_LABELS[s]}</option>
                  );
                })}
              </select>

              {order.paymentMethod === "upi" && order.paymentStatus !== "paid" && (
                <Link
                  to={`/admin/chats/${order.id}`}
                  className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5"
                >
                  <MessageCircle size={14} /> Payment Chat
                </Link>
              )}
            </div>

          </div>
        ))}
      </div>
      {(orders?.length || 0) > PAGE_SIZE && (
        <div className="card p-0 mt-3">
          <Pagination totalItems={orders.length} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />
        </div>
      )}

      {pendingShipOrder && (
        <ShippingDetailsModal
          order={pendingShipOrder}
          onCancel={() => setPendingShipOrder(null)}
          onConfirm={confirmShipped}
          isPending={mutation.isPending}
        />
      )}
    </div>
  );
}
