import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, ArrowRight } from "lucide-react";
import { fetchProducts, fetchCategories } from "@/services/products";
import { useIsAdmin } from "@/lib/isAdmin";
import ProductCard from "@/components/product/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import UnsplashImage from "@/components/ui/UnsplashImage";

const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
];

export default function Shop() {
  const isAdmin = useIsAdmin();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || null,
    maxPrice: 1600,
    inStockOnly: false,
  });
  const [sort, setSort] = useState("popularity");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", filters.category],
    queryFn: () => fetchProducts({ category: filters.category }),
  });
  const { data: allProductsData } = useQuery({
    queryKey: ["products", "all-for-counts"],
    queryFn: () => fetchProducts({}),
  });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const countByCategory = (allProductsData?.data || []).reduce((acc, p) => {
    const slug = p.category?.slug;
    if (slug) acc[slug] = (acc[slug] || 0) + 1;
    return acc;
  }, {});

  const filteredSorted = useMemo(() => {
    let items = data?.data || [];
    items = items.filter((p) => p.price <= filters.maxPrice);
    if (filters.inStockOnly) items = items.filter((p) => p.inStock);

    const sorted = [...items];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [data, filters, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
      <div className="relative rounded-2xl overflow-hidden h-56 md:h-64 border border-caramel-400/20 mb-3.5 shadow-sm">
        <UnsplashImage query="strawberry dessert jar on table" alt="Our Dessert Jars" className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-cream-50/95 via-cream-50/80 to-transparent dark:from-[#0f0b07]/95 dark:via-[#0f0b07]/75 dark:to-transparent" />
        <div className="absolute inset-0 flex items-center px-7 md:px-12">
          <div className="max-w-[420px]">
            <p className="font-script text-lg text-caramel-600 dark:text-caramel-300 mb-1">
              Fresh • Eggless • Not too Sweet
            </p>
            <h1 className="font-display text-3xl md:text-[2.4rem] font-bold text-cocoa-800 leading-tight">
              Our Dessert Jars
            </h1>
            <p className="font-script text-2xl md:text-3xl text-caramel-500 dark:text-caramel-300 leading-none mt-1.5 mb-3">
              Real Ingredients. Pure Happiness.
            </p>
            <p className="text-xs text-cocoa-600 leading-5 max-w-sm">
              Handcrafted dessert jars made with love and layered with deliciousness. Freshly made for every sweet moment.
            </p>
          </div>
        </div>
      </div>

      {!categories ? (
        <Spinner className="my-8" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group rounded-2xl border border-caramel-400/15 bg-white/65 dark:bg-[#17110b]/65 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <UnsplashImage image={cat.image} query={cat.imageQuery} alt={cat.name} className="h-11 w-11 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-cocoa-800 truncate">{cat.name}</p>
                <p className="text-[10px] text-cocoa-400 mt-0.5">{countByCategory[cat.slug] || 0} Products</p>
              </div>
              <ArrowRight size={13} className="text-caramel-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-caramel-600 dark:text-caramel-300 mb-1">
            Fresh from our kitchen
          </p>
          <h2 className="font-display text-2xl font-bold text-cocoa-800">All Products</h2>
          <p className="text-[11px] text-cocoa-500 mt-0.5">
            Showing {filteredSorted.length} product{filteredSorted.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="relative">
          <SlidersHorizontal size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-400 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none border border-cream-300 dark:border-white/10 rounded-full pl-9 pr-8 py-2 text-xs text-cocoa-700 bg-white/65 dark:bg-black/20 outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>Sort by: {o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-[205px_1fr] gap-5">
        <FilterSidebar filters={filters} setFilters={setFilters} categoryCounts={countByCategory} />

        <div>
          {isLoading && <Spinner />}
          {isError && <p className="text-berry-500 text-sm">Could not load products.</p>}
          {!isLoading && filteredSorted.length === 0 && (
            <EmptyState title="No products match your filters" subtitle="Try adjusting the price range or category." />
          )}
          {!isLoading && filteredSorted.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredSorted.map((product) => (
                <ProductCard key={product.id} product={product} hideCartAction={isAdmin} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-caramel-400/15 bg-white/55 dark:bg-[#17110b]/60 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-caramel-500/15">
        {[
          ["Freshly Made", "Prepared with care for every order."],
          ["Handcrafted", "Every jar is layered and finished with attention to detail."],
          ["Made With Love", "Because that's how this journey started — and how we want it to continue."],
        ].map(([label, sub]) => (
          <div key={label} className="px-5 py-4 text-center">
            <p className="text-xs font-semibold text-cocoa-800">{label}</p>
            <p className="text-[10px] text-cocoa-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
