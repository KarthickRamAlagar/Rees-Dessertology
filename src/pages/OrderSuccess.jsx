import { useParams, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const estDate = new Date(Date.now() + 6 * 86400000).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <CheckCircle2 size={64} className="text-sage-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-cocoa-800 mb-2">Order Placed!</h1>
      <p className="text-cocoa-500 mb-1">Thank you for your order</p>
      <p className="text-cocoa-400 text-sm mb-6">Order #{orderId}</p>

      <div className="glass-panel rounded-glass p-4 mb-6 text-sm text-cocoa-600">
        Estimated Delivery: <span className="font-medium text-cocoa-800">{estDate}</span>
      </div>

      <div className="flex flex-col gap-3">
        <Link to={`/order/${orderId}/track`} className="btn-primary">Track Order</Link>
        <Link to="/shop" className="btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
}
