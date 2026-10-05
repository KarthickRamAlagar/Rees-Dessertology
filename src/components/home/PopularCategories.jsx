import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { fetchCategories, fetchProducts } from "@/services/products";
import Spinner from "@/components/ui/Spinner";
import UnsplashImage from "@/components/ui/UnsplashImage";

export default function PopularCategories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const { data: productsData } = useQuery({
    queryKey: ["products", "all-for-counts"],
    queryFn: () => fetchProducts({}),
  });
  const countByCategory = (productsData?.data || []).reduce((acc, p) => {
    const slug = p.category?.slug;
    if (slug) acc[slug] = (acc[slug] || 0) + 1;
    return acc;
  }, {});

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-7 md:py-9">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-caramel-600 dark:text-caramel-300 mb-1.5">
            Explore Our Flavours
          </p>
          <h2 className="font-display text-2xl md:text-[25px] font-bold text-cocoa-800">
            Our Dessert Categories
          </h2>
        </div>
        <Link to="/shop" className="text-[11px] md:text-xs text-caramel-600 dark:text-caramel-300 font-medium flex items-center gap-1 hover:gap-1.5 transition-all">
          View All <ArrowRight size={13} />
        </Link>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group overflow-hidden rounded-2xl border border-caramel-400/20 bg-white/65 dark:bg-[#17110b]/65 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all"
            >
              <div className="relative h-28 md:h-32 overflow-hidden">
                <UnsplashImage
                  image={cat.image}
                  query={cat.imageQuery}
                  alt={cat.name}
                  className="h-full w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              </div>
              <div className="p-3 md:p-3.5 flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-semibold text-cocoa-800 truncate">{cat.name}</p>
                  <p className="text-[10px] text-cocoa-400 mt-0.5">{countByCategory[cat.slug] || 0} Products</p>
                </div>
                <span className="h-7 w-7 rounded-full border border-caramel-400/40 flex items-center justify-center shrink-0 text-caramel-600 dark:text-caramel-300 group-hover:bg-caramel-500 group-hover:text-white transition-colors">
                  <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
