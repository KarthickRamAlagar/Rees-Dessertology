import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Circle, MapPin, Truck, Phone, Mail, PackageCheck, MessageCircle } from "lucide-react";
import { fetchOrderById, markOrderDelivered } from "@/services/orders";
import Spinner from "@/components/ui/Spinner";
import { selectUser } from "@/store/authSlice";
import FeedbackPrompt from "@/components/feedback/FeedbackPrompt";

const STEPS = ["placed", "packed", "shipped", "outForDelivery", "delivered"];

export default function TrackOrder() {
  const { orderId } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const uid = useSelector(selectUser)?.uid;

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", uid, orderId],
    enabled: Boolean(uid),
    retry: false,
    queryFn: () => fetchOrderById(orderId),
  });

  const navigate = useNavigate();
  const deliverMutation = useMutation({
    mutationFn: () => markOrderDelivered(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", uid, orderId] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      // Order cycle complete (paid + delivered; the chat was deleted
      // server-side) -> back to the landing page.
      navigate("/");
    },
  });

  if (isLoading) return <Spinner className="py-24" />;
  if (!order) {
    const forbidden = error?.response?.status === 403;
    return (
      <p className="p-10 text-center text-cocoa-500">
        {forbidden ? "This order belongs to a different account. Sign in with the Google account you ordered with." : "Order not found."}
      </p>
    );
  }

  const completedSteps = order.statusHistory.map((h) => h.step);
  const hasShippingDetails = ["shipped", "outForDelivery", "delivered"].includes(order.status) && order.shippingDetails;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-cocoa-800 mb-1">Order #{order.id}</h1>
      <p className="text-sm text-cocoa-500 mb-6">
        Placed on {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      {/* When placed + total cost, up front */}
      <div className="glass-panel rounded-glass p-5 flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-cocoa-400">Order Total</p>
          <p className="text-2xl font-bold text-cocoa-800">₹{order.total}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-cocoa-400">Current Status</p>
          <p className="text-sm font-semibold text-caramel-600">{t(`order.status.${order.status}`)}</p>
          {order.paymentStatus && (
            <p className="text-xs text-cocoa-500 mt-1">
              Payment: <span className={order.paymentStatus === "paid" ? "text-sage-500 font-medium" : "text-berry-500 font-medium"}>{order.paymentStatus}</span>
            </p>
          )}
        </div>
      </div>

      {/* Products in this order */}
      <h2 className="font-semibold text-cocoa-800 mb-3">You Ordered</h2>
      <div className="space-y-2 mb-6">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm text-cocoa-600 glass-panel rounded-glass p-3">
            <span>{item.name} × {item.qty} ({item.weight})</span>
            <span>₹{item.price * item.qty}</span>
          </div>
        ))}
      </div>

      {/* Each status change gets its own glass card, in order reached */}
      <h2 className="font-semibold text-cocoa-800 mb-3">Order Progress</h2>
      <div className="space-y-3 mb-6">
        {STEPS.map((step) => {
          const historyEntry = order.statusHistory.find((h) => h.step === step);
          const done = completedSteps.includes(step);

          if (done) {
            return (
              <div key={step} className="glass-panel-dark rounded-glass p-4 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-caramel-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">{t(`order.status.${step}`)}</p>
                  {historyEntry && (
                    <p className="text-xs text-white/60">
                      {new Date(historyEntry.time).toLocaleString("en-IN", {
                        day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={step} className="flex items-center gap-3 px-4 py-2 text-cocoa-400">
              <Circle size={18} className="shrink-0" />
              <p className="text-sm">{t(`order.status.${step}`)}</p>
            </div>
          );
        })}
      </div>

      {/* QR/UPI orders not yet paid get the payment chat instead of a plain
          "Confirm Payment Received" button — admin confirms/rejects inline
          from the payment-proof bubble (see AdminOrders.jsx). COD orders
          have no payment ambiguity to resolve this way. */}
      {order.paymentMethod === "upi" && order.paymentStatus !== "paid" && (
        <div className="mb-6">
          <h2 className="font-semibold text-cocoa-800 mb-3">Payment</h2>
          <Link
            to={`/order/${order.id}/chat`}
            className="glass-panel rounded-glass p-5 flex items-center justify-between gap-4 hover:shadow-lg transition-shadow"
          >
            <div className="min-w-0">
              <p className="font-medium text-cocoa-800">
                {order.paymentStatus === "failed" ? "Payment not received — open the chat" : "Payment pending — open the payment chat"}
              </p>
              <p className="text-xs text-cocoa-500 mt-0.5">Scan the QR, pay, tap &quot;I've paid&quot; and wait for the admin to confirm.</p>
            </div>
            <span className="btn-primary shrink-0 flex items-center gap-1.5 text-sm"><MessageCircle size={16} /> Open chat</span>
          </Link>
        </div>
      )}

      <FeedbackPrompt order={order} />

      {/* Mark as Delivered — only once the order has actually shipped, and
          only on this specific order's card. */}
      {order.status === "shipped" && (
        <button
          onClick={() => deliverMutation.mutate()}
          disabled={deliverMutation.isPending}
          className="btn-primary w-full mb-6 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <PackageCheck size={18} />
          {deliverMutation.isPending ? "Updating…" : "I've received my order — Mark as Delivered"}
        </button>
      )}
      {deliverMutation.isError && (
        <p className="text-danger-500 text-sm -mt-4 mb-6">
          {deliverMutation.error?.response?.data?.error || "Couldn't update — try again."}
        </p>
      )}

      {/* Vendor / courier details — only visible once the admin has shipped
          the order and filled these in. */}
      {hasShippingDetails && (
        <div className="glass-panel rounded-glass p-4 mb-6">
          <p className="text-sm font-medium text-cocoa-700 mb-3 flex items-center gap-2">
            <Truck size={16} className="text-caramel-500" /> Shipping Details
          </p>
          <div className="space-y-2 text-sm text-cocoa-600">
            {order.shippingDetails.vendorName && <p>Courier: {order.shippingDetails.vendorName}</p>}
            {order.shippingDetails.vendorContact && (
              <p className="flex items-center gap-2"><Phone size={14} className="text-cocoa-400" /> {order.shippingDetails.vendorContact}</p>
            )}
            {order.shippingDetails.supportEmail && (
              <p className="flex items-center gap-2"><Mail size={14} className="text-cocoa-400" /> {order.shippingDetails.supportEmail}</p>
            )}
          </div>
        </div>
      )}

      <div className="glass-panel rounded-glass p-4 flex items-start gap-3">
        <MapPin size={18} className="text-caramel-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-cocoa-700">Delivery Address</p>
          <p className="text-sm text-cocoa-500">{order.address}</p>
        </div>
      </div>
    </div>
  );
}
