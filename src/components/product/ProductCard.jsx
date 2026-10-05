import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, ShoppingBag, Zap } from "lucide-react";
import { useCartStore } from "@/features/cart/cartStore";
import { useWishlistStore } from "@/features/wishlist/wishlistStore";
import RatingStars from "@/components/ui/RatingStars";
import Badge from "@/components/ui/Badge";
import UnsplashImage from "@/components/ui/UnsplashImage";

// hideCartAction: passed by pages that need to suppress the Add-to-Cart
// control for a viewer who shouldn't be buying (e.g. an admin on /shop) —
// defaults to false so every other usage of this card is unaffected.
export default function ProductCard({ product, hideCartAction = false }) {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();
  const { toggleItem, isWishlisted } = useWishlistStore();
  const {
    name, price, compareAtPrice, slug, rating, reviewCount, category, weights, inStock, imageQuery, images,
  } = product;

  const wishlisted = isWishlisted(product.id);
  const discount = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  return (
    <div className="group rounded-2xl overflow-hidden border border-caramel-400/15 bg-white/70 dark:bg-[#17110b]/70 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative flex flex-col">
      <div className="relative">
        <Link to={`/product/${slug}`} className="block">
          <UnsplashImage image={images?.[0]} query={imageQuery} alt={name} className="h-40 md:h-44 w-full" />
        </Link>
        {category?.name && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge tone="caramel">{category.name}</Badge>
          </div>
        )}
        <button
          onClick={() => toggleItem({ id: product.id, name, price, slug })}
          aria-label="Toggle wishlist"
          className="absolute top-2.5 right-2.5 z-10 h-7 w-7 rounded-full bg-white/85 dark:bg-black/35 backdrop-blur-sm flex items-center justify-center text-cocoa-400 hover:text-berry-500 shadow-sm"
        >
          <Heart size={14} className={wishlisted ? "fill-berry-500 text-berry-500" : ""} />
        </button>
        {!inStock && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
            <span className="text-white text-[10px] font-semibold tracking-wide bg-black/45 px-3 py-1 rounded-full">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <Link to={`/product/${slug}`} className="block flex-1">
          <p className="font-display font-semibold text-cocoa-800 text-sm leading-snug line-clamp-1">{name}</p>
          <div className="mt-1">
            <RatingStars rating={rating} showCount count={reviewCount} size={10} />
          </div>
          {weights?.length > 0 && (
            <p className="text-[10px] text-cocoa-400 mt-1">{weights[0]}</p>
          )}
        </Link>

        <div className="flex items-baseline gap-1.5 mt-2">
          <p className="text-cocoa-800 font-bold text-sm">₹{price}</p>
          {compareAtPrice && <p className="text-cocoa-400 text-[10px] line-through">₹{compareAtPrice}</p>}
          {discount > 0 && <span className="ml-auto text-[9px] font-medium text-sage-500">{discount}% off</span>}
        </div>

        {!hideCartAction && (
          <button
            onClick={() => addItem({ id: product.id, name, price, weight: weights?.[0] || "1 unit", slug })}
            disabled={!inStock}
            className="btn-primary w-full mt-2.5 text-[10px] py-2 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={12} />
            {inStock ? t("product.addToCart") : t("product.outOfStock")}
          </button>
        )}
        {!hideCartAction && inStock && (
          <button
            onClick={() => {
              addItem({ id: product.id, name, price, weight: weights?.[0] || "1 unit", slug });
              navigate("/checkout");
            }}
            className="btn-secondary w-full mt-1.5 text-[10px] py-2 flex items-center justify-center gap-1.5"
          >
            <Zap size={12} /> Buy Now
          </button>
        )}
      </div>
    </div>
  );
}
