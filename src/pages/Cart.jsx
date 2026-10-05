import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useCartStore } from "@/features/cart/cartStore";
import QuantitySelector from "@/components/ui/QuantitySelector";
import EmptyState from "@/components/ui/EmptyState";
import UnsplashImage from "@/components/ui/UnsplashImage";
import { findProductBySlug } from "@/data/mockProducts";

export default function Cart() {
  const { t } = useTranslation();
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();

  const sub = subtotal();
  const delivery = sub > 999 || sub === 0 ? 0 : 50;
  const total = sub + delivery;

  if (items.length === 0) {
    return (
      <EmptyState
        title={t("cart.empty")}
        subtitle="Looks like you haven't added anything organic yet."
        ctaLabel="Continue Shopping"
        ctaTo="/shop"
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-[1fr_320px] gap-8">
      <div>
        <h1 className="text-2xl font-bold text-cocoa-800 mb-6">{t("cart.title")} ({items.length})</h1>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={`${item.id}-${item.weight}`} className="glass-panel rounded-glass p-4 flex items-center gap-4">
              <UnsplashImage
                query={findProductBySlug(item.slug)?.imageQuery}
                alt={item.name}
                className="h-16 w-16 rounded-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-cocoa-700 truncate">{item.name}</p>
                <p className="text-sm text-cocoa-500">{item.weight}</p>
                <p className="text-sm text-caramel-600 font-semibold mt-1">₹{item.price}</p>
              </div>
              <QuantitySelector
                value={item.quantity}
                onChange={(q) => updateQuantity(item.id, item.weight, q)}
              />
              <button
                onClick={() => removeItem(item.id, item.weight)}
                aria-label="Remove item"
                className="text-cocoa-400 hover:text-berry-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-glass p-5 h-fit sticky top-20">
        <h2 className="font-semibold text-cocoa-800 mb-4">Price Details</h2>
        <div className="space-y-2 text-sm text-cocoa-600">
          <div className="flex justify-between"><span>Items ({items.length})</span><span>₹{sub}</span></div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span className={delivery === 0 ? "text-sage-500 font-medium" : ""}>
              {delivery === 0 ? "FREE" : `₹${delivery}`}
            </span>
          </div>
          <div className="border-t border-cream-200 pt-2 flex justify-between font-semibold text-cocoa-800">
            <span>{t("cart.total")}</span>
            <span>₹{total}</span>
          </div>
        </div>
        <Link to="/checkout" className="btn-primary w-full block text-center mt-5">
          {t("cart.checkout")}
        </Link>
      </div>
    </div>
  );
}
