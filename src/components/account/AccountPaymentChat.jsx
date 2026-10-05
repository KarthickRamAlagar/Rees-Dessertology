import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MessageCircle, CheckCircle2, Clock, XCircle, Truck } from "lucide-react";
import { useMyOrders } from "@/hooks/useMyOrders";
import { selectOrder, selectSelectedOrderId } from "@/store/chatUiSlice";
import CustomerOrderChat from "@/components/chat/CustomerOrderChat";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

const PAY = {
  paid: { label: "Paid", Icon: CheckCircle2, cls: "bg-sage-500/15 text-sage-500" },
  failed: { label: "Not received", Icon: XCircle, cls: "bg-berry-500/15 text-berry-500" },
  pending: { label: "Pending", Icon: Clock, cls: "bg-caramel-400/20 text-caramel-600" },
};

// "Payment Chat" section of the Account page (see Account.jsx). Only shown
// when the signed-in customer has at least one order. QR/UPI orders can be
// paid and confirmed in their chat; a delivered order's chat is deleted
// automatically to save storage.
export default function AccountPaymentChat() {
  const dispatch = useDispatch();
  const selectedId = useSelector(selectSelectedOrderId);
  const { data: orders, isLoading } = useMyOrders();

  if (isLoading) return <Spinner className="py-10" />;
  if (!orders?.length) {
    return <EmptyState title="No orders yet" subtitle="Once you place an order, its payment chat shows up here." ctaLabel="Start Shopping" ctaTo="/shop" />;
  }

  const selected = orders.find((o) => o.id === selectedId) || orders.find((o) => o.status !== "delivered") || orders[0];

  return (
    <div>
      <h1 className="text-2xl font-bold text-cocoa-800 mb-4">Payment Chat</h1>

      {/* Order picker — horizontal strip so it works at every width */}
      <div className="flex gap-3 overflow-x-auto pb-3 mb-4 -mx-1 px-1">
        {orders.map((o) => {
          const pay = PAY[o.paymentStatus] || PAY.pending;
          const active = selected?.id === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => dispatch(selectOrder(o.id))}
              className={`glass-panel rounded-glass p-3 text-left shrink-0 w-48 transition-shadow ${active ? "ring-2 ring-caramel-400" : "hover:ring-1 hover:ring-caramel-400/40"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-cocoa-800 text-sm">#{o.id}</p>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${pay.cls}`}>
                  <pay.Icon size={11} /> {pay.label}
                </span>
              </div>
              <p className="text-xs text-cocoa-500 mt-1">₹{o.total} · QR / UPI{o.status === "delivered" ? " · delivered" : ""}</p>
              <p className="text-[11px] text-cocoa-400 mt-0.5">
                {new Date(o.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </p>
            </button>
          );
        })}
      </div>

      <CustomerOrderChat
        orderNumber={selected.id}
        className="h-[640px] max-h-[calc(100vh-10rem)] min-h-[520px]"
        asideFrom="xl"
      />
    </div>
  );
}
