import { useState } from "react";
import { Link } from "react-router-dom";
import { useMyOrders } from "@/hooks/useMyOrders";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import Pager from "@/components/ui/Pager";

const PAGE_SIZE = 5;

const TABS = ["All", "Processing", "Delivered"];
const STATUS_TONE = { delivered: "organic", processing: "caramel" };
const PAYMENT_TONE = { paid: "organic", pending: "sale" };

export default function MyOrders({ embedded = false }) {
  const [tab, setTab] = useState("All");
  const [page, setPage] = useState(1);
  const { data: orders, isLoading } = useMyOrders();

  const filtered = orders?.filter((o) => tab === "All" || o.status === tab.toLowerCase()) || [];

  return (
    <div className={embedded ? "" : "max-w-3xl mx-auto px-6 py-10"}>
      {!embedded && <h1 className="text-2xl font-bold text-cocoa-800 mb-6">My Orders</h1>}

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t
                ? "bg-caramel-500 text-white shadow-sm"
                : "bg-cream-200 text-cocoa-600 hover:bg-cream-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}
      {!isLoading && filtered.length === 0 && (
        <EmptyState title="No orders here" subtitle="Orders you place will show up here." ctaLabel="Start Shopping" ctaTo="/shop" />
      )}

      <div className="space-y-4">
        {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((order) => (
          <Link
            key={order.id}
            to={`/order/${order.id}/track`}
            className="glass-panel rounded-glass p-4 block hover:ring-1 hover:ring-caramel-400/40 transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-cocoa-800">Order #{order.id}{order.userName ? <span className="font-normal text-cocoa-500"> · {order.userName}</span> : null}</p>
                <p className="text-xs text-cocoa-400">{new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <Badge tone={STATUS_TONE[order.status] || "default"}>{order.status}</Badge>
            </div>
            <p className="text-sm text-cocoa-500 mb-3">
              {order.items.map((i) => i.name).join(", ")}
            </p>
            {order.paymentStatus && (
              <div className="mb-3">
                <Badge tone={PAYMENT_TONE[order.paymentStatus] || "default"}>
                  Payment: {order.paymentStatus}
                </Badge>
              </div>
            )}
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-cocoa-800">₹{order.total}</p>
              {order.status === "delivered" && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  Reorder
                </button>
              )}
            </div>
          </Link>
        ))}
      </div>
      <Pager totalItems={filtered.length} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />
    </div>
  );
}
