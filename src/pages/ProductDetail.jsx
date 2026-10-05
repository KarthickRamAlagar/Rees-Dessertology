import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Heart, Leaf, EggOff, Snowflake, Check, ShoppingBag, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchProductBySlug, fetchRelatedProducts, getCategorySlug } from "@/services/products";
import { useCartStore } from "@/features/cart/cartStore";
import { useWishlistStore } from "@/features/wishlist/wishlistStore";
import RatingStars from "@/components/ui/RatingStars";
import Badge from "@/components/ui/Badge";
import QuantitySelector from "@/components/ui/QuantitySelector";
import Spinner from "@/components/ui/Spinner";
import UnsplashImage from "@/components/ui/UnsplashImage";
import ProductCard from "@/components/product/ProductCard";
import JarLogo from "@/components/ui/JarLogo";

const TABS = ["Description", "Ingredients", "Reviews"];

const QUICK_BADGES = [
  { icon: Leaf, label: "Fresh Ingredients", sub: "No artificial preservatives" },
  { icon: EggOff, label: "Eggless", sub: "Made with care" },
  { icon: Snowflake, label: "Refrigerate", sub: "Best enjoyed chilled" },
];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isWishlisted } = useWishlistStore();

  const [selectedWeight, setSelectedWeight] = useState(null);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("Description");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });

  const categorySlug = getCategorySlug(product);

  const { data: related } = useQuery({
    queryKey: ["related", slug, categorySlug],
    queryFn: () => fetchRelatedProducts(slug, categorySlug),
    enabled: !!product,
  });

  if (isLoading) return <Spinner className="py-24" />;
  if (!product) return <p className="p-10 text-cocoa-500 text-center">Product not found.</p>;

  const {
    name, price, compareAtPrice, description, rating, reviewCount,
    weights, badges, nutrition, category, inStock, imageQuery, images,
  } = product;

  const weight = selectedWeight || weights?.[0];
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addItem({ id: product.id, name, price, weight, slug, quantity: qty });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-5">
      <div className="rounded-2xl border border-caramel-400/15 bg-white/50 dark:bg-[#17110b]/50 p-4 md:p-5 shadow-sm">
        <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-7 items-start">
          <div className="flex gap-3">
            <div className="hidden sm:flex flex-col gap-2 w-14 shrink-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-14 rounded-xl overflow-hidden border-2 ${
                    i === 0 ? "border-caramel-500" : "border-transparent opacity-60"
                  }`}
                >
                  <UnsplashImage image={images?.[0]} query={imageQuery} alt={name} className="h-full w-full" />
                </div>
              ))}
            </div>

            <div className="relative overflow-hidden rounded-2xl h-[330px] md:h-[400px] flex-1 border border-caramel-400/15">
              <UnsplashImage image={images?.[0]} query={imageQuery} alt={name} className="w-full h-full" />
              <button
                onClick={() => toggleItem({ id: product.id, name, price, slug })}
                className="absolute top-3.5 right-3.5 bg-white/85 dark:bg-black/40 backdrop-blur-sm rounded-full p-2.5 z-10 shadow-sm"
                aria-label="Toggle wishlist"
              >
                <Heart size={17} className={wishlisted ? "fill-berry-500 text-berry-500" : "text-cocoa-500"} />
              </button>
              {category?.name && (
                <div className="absolute top-3.5 left-3.5 z-10">
                  <Badge tone="caramel">{category.name}</Badge>
                </div>
              )}
              <button className="absolute bottom-4 left-4 h-8 w-8 rounded-full bg-white/90 dark:bg-black/50 flex items-center justify-center text-cocoa-700">
                <ChevronLeft size={15} />
              </button>
              <button className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-white/90 dark:bg-black/50 flex items-center justify-center text-cocoa-700">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className="pt-1">
            <h1 className="font-display text-3xl md:text-[2rem] font-bold text-cocoa-800 leading-tight">{name}</h1>
            <div className="mt-2">
              <RatingStars rating={rating} showCount count={reviewCount} />
            </div>

            <div className="flex items-baseline gap-3 mt-4 mb-4">
              <p className="text-2xl md:text-3xl text-cocoa-800 font-bold">₹{price}</p>
              {compareAtPrice && <p className="text-sm text-cocoa-400 line-through">₹{compareAtPrice}</p>}
            </div>

            {description && (
              <p className="text-xs md:text-[13px] text-cocoa-600 leading-5.5 mb-5">{description}</p>
            )}

            {weights?.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-cocoa-700 mb-2">Select Weight</p>
                <div className="flex gap-2 flex-wrap">
                  {weights.map((w) => (
                    <button
                      key={w}
                      onClick={() => setSelectedWeight(w)}
                      className={`min-w-20 px-4 py-2 rounded-lg text-xs border transition-colors ${
                        weight === w
                          ? "bg-caramel-500 text-white border-caramel-500"
                          : "border-cream-300 dark:border-white/10 text-cocoa-600 hover:border-caramel-400"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2.5 mb-5">
              <QuantitySelector value={qty} onChange={setQty} />
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2 text-xs h-11"
              >
                <ShoppingBag size={15} />
                {inStock ? t("product.addToCart") : t("product.outOfStock")}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="btn-secondary flex-1 disabled:opacity-50 flex items-center justify-center gap-2 text-xs h-11"
              >
                <Zap size={15} /> Buy Now
              </button>
              <button
                onClick={() => toggleItem({ id: product.id, name, price, slug })}
                className="h-11 w-11 rounded-lg border border-cream-300 dark:border-white/10 flex items-center justify-center shrink-0 hover:border-caramel-500"
                aria-label="Toggle wishlist"
              >
                <Heart size={16} className={wishlisted ? "fill-berry-500 text-berry-500" : "text-cocoa-500"} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {QUICK_BADGES.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="rounded-xl border border-caramel-400/15 bg-caramel-400/5 p-2.5 text-center">
                  <Icon size={15} className="text-caramel-600 dark:text-caramel-300 mx-auto mb-1.5" />
                  <p className="text-[10px] font-semibold text-cocoa-800 leading-tight">{label}</p>
                  <p className="text-[9px] text-cocoa-400 leading-tight mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {badges?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {badges.map((b) => <Badge key={b} tone="organic">{b}</Badge>)}
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_280px] gap-5 mt-7 pt-5 border-t border-cocoa-500/10">
          <div>
            <div className="flex gap-5 border-b border-cocoa-500/10 mb-4">
              {TABS.map((tb) => (
                <button
                  key={tb}
                  onClick={() => setTab(tb)}
                  className={`px-0 pb-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${
                    tab === tb ? "border-caramel-500 text-caramel-600" : "border-transparent text-cocoa-500 hover:text-cocoa-700"
                  }`}
                >
                  {tb}{tb === "Reviews" && reviewCount ? ` (${reviewCount})` : ""}
                </button>
              ))}
            </div>

            {tab === "Description" && (
              <div className="rounded-2xl border border-caramel-400/15 bg-white/45 dark:bg-black/10 p-5">
                <h3 className="font-display text-sm font-semibold text-cocoa-800 mb-2">A Perfect Balance of Freshness & Indulgence</h3>
                <p className="text-xs text-cocoa-600 leading-5">
                  {description || "A delightful dessert jar made with real ingredients and layered by hand."}
                </p>
              </div>
            )}

            {tab === "Ingredients" && (
              <div className="rounded-2xl border border-caramel-400/15 bg-white/45 dark:bg-black/10 p-5">
                <h3 className="font-display text-sm font-semibold text-cocoa-800 mb-3">Nutrition (per 100g)</h3>
                {nutrition && Object.keys(nutrition).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {Object.entries(nutrition).map(([k, v]) => (
                      v != null && v !== "" ? (
                        <div key={k} className="rounded-lg bg-caramel-400/10 px-2 py-2 text-center">
                          <p className="text-[10px] text-cocoa-400 capitalize">{k}</p>
                          <p className="text-xs font-semibold text-cocoa-800">{v}</p>
                        </div>
                      ) : null
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-cocoa-500">Nutrition details coming soon.</p>
                )}
              </div>
            )}

            {tab === "Reviews" && (
              <div className="rounded-2xl border border-caramel-400/15 bg-white/45 dark:bg-black/10 p-5">
                <div className="flex items-center gap-3">
                  <RatingStars rating={rating} size={15} />
                  <p className="text-xs text-cocoa-600">{rating} out of 5 ({reviewCount || 0} reviews)</p>
                </div>
                <p className="text-xs text-cocoa-500 mt-3">Individual review listings are coming soon.</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-caramel-400/15 bg-caramel-400/5 p-5 h-fit">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-8 w-8 rounded-full bg-caramel-400/10 flex items-center justify-center text-caramel-600">
                <JarLogo size={16} />
              </span>
              <h3 className="text-xs font-semibold text-cocoa-800">Why You'll Love It</h3>
            </div>
            <ul className="space-y-2.5">
              {[
                "Made with fresh, seasonal ingredients",
                "Eggless & preservative free",
                "Perfect for gifting or personal indulgence",
                "Beautifully layered in our signature jar",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2 text-xs text-cocoa-600">
                  <Check size={13} className="text-sage-500 shrink-0 mt-0.5" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {related?.length > 0 && (
        <div className="mt-7">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-caramel-600 dark:text-caramel-300">Curated for you</p>
              <h2 className="font-display text-xl font-bold text-cocoa-800">You May Also Like</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
