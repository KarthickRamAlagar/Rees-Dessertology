import { Heart } from "lucide-react";
import { useWishlistStore } from "@/features/wishlist/wishlistStore";
import { useCartStore } from "@/features/cart/cartStore";
import EmptyState from "@/components/ui/EmptyState";
import UnsplashImage from "@/components/ui/UnsplashImage";
import { findProductBySlug } from "@/data/mockProducts";
import { Link } from "react-router-dom";

export default function Wishlist({ embedded = false }) {
  const { items, removeItem } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        subtitle="Save your favorite organic treats here for later."
        ctaLabel="Explore Products"
        ctaTo="/shop"
      />
    );
  }

  return (
    <div className={embedded ? "" : "max-w-3xl mx-auto px-6 py-10"}>
      {!embedded && <h1 className="text-2xl font-bold text-cocoa-800 mb-6">My Wishlist ({items.length})</h1>}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="glass-panel rounded-glass p-4 flex items-center gap-4">
            <UnsplashImage
              query={findProductBySlug(item.slug)?.imageQuery}
              alt={item.name}
              className="h-16 w-16 rounded-lg shrink-0"
            />
            <div className="flex-1 min-w-0">
              <Link to={`/product/${item.slug}`} className="font-medium text-cocoa-700 hover:text-caramel-600 truncate block">
                {item.name}
              </Link>
              <p className="text-sm text-caramel-600 font-semibold">₹{item.price}</p>
            </div>
            <button onClick={() => addItem({ ...item, weight: "1 unit" })} className="btn-primary text-xs py-1.5 px-4">
              Add to Cart
            </button>
            <button onClick={() => removeItem(item.id)} aria-label="Remove" className="text-cocoa-400 hover:text-berry-500">
              <Heart size={18} className="fill-berry-500 text-berry-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
