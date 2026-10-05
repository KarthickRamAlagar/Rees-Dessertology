import { useCartStore } from "@/features/cart/cartStore";

export default function OrderSummary({ deliveryPrice = 0 }) {
  const { items, subtotal } = useCartStore();
  const sub = subtotal();
  const total = sub + deliveryPrice;

  return (
    <div className="glass-panel rounded-glass p-5 h-fit sticky top-20">
      <h3 className="font-semibold text-cocoa-800 mb-4">Order Summary</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
        {items.map((item) => (
          <div key={`${item.id}-${item.weight}`} className="flex justify-between text-sm text-cocoa-600">
            <span className="truncate pr-2">{item.name} × {item.quantity}</span>
            <span className="shrink-0">₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-cream-200 pt-3 space-y-1 text-sm">
        <div className="flex justify-between text-cocoa-600"><span>Subtotal</span><span>₹{sub}</span></div>
        <div className="flex justify-between text-cocoa-600">
          <span>Delivery</span>
          <span>{deliveryPrice === 0 ? "FREE" : `₹${deliveryPrice}`}</span>
        </div>
        <div className="flex justify-between font-semibold text-cocoa-800 text-base pt-1">
          <span>Total</span><span>₹{total}</span>
        </div>
      </div>
    </div>
  );
}
