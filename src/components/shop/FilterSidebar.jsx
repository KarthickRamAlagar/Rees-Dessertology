import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { fetchCategories } from "@/services/products";

export default function FilterSidebar({ filters, setFilters, categoryCounts = {} }) {
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const toggleCategory = (slug) => {
    setFilters((f) => ({ ...f, category: f.category === slug ? null : slug }));
  };

  const totalCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <aside className="rounded-2xl border border-caramel-400/15 bg-white/55 dark:bg-[#17110b]/60 p-4 h-fit md:sticky md:top-24 shadow-sm">
      <h3 className="font-display text-sm font-bold text-cocoa-800 mb-4 flex items-center gap-2">
        <SlidersHorizontal size={14} className="text-caramel-600" />
        Filter Products
      </h3>

      <div className="mb-5 pb-5 border-b border-cocoa-500/10">
        <p className="text-[11px] font-semibold text-cocoa-700 mb-3">Category</p>
        <div className="space-y-2.5">
          <label className="flex items-center justify-between gap-2 text-[11px] text-cocoa-600 cursor-pointer">
            <span className="flex items-center gap-2">
              <input
                type="radio"
                checked={!filters.category}
                onChange={() => setFilters((f) => ({ ...f, category: null }))}
                className="accent-caramel-500"
              />
              All Categories
            </span>
            <span className="text-[10px] text-cocoa-400">{totalCount}</span>
          </label>
          {categories?.map((cat) => (
            <label key={cat.id} className="flex items-center justify-between gap-2 text-[11px] text-cocoa-600 cursor-pointer">
              <span className="flex items-center gap-2 min-w-0">
                <input
                  type="radio"
                  checked={filters.category === cat.slug}
                  onChange={() => toggleCategory(cat.slug)}
                  className="accent-caramel-500"
                />
                <span className="truncate">{cat.name}</span>
              </span>
              <span className="text-[10px] text-cocoa-400">{categoryCounts[cat.slug] || 0}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-5 pb-5 border-b border-cocoa-500/10">
        <p className="text-[11px] font-semibold text-cocoa-700 mb-3">Price Range</p>
        <input
          type="range"
          min="0"
          max="1600"
          value={filters.maxPrice}
          onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
          className="w-full accent-caramel-500"
        />
        <div className="flex justify-between text-[10px] text-cocoa-500 mt-1.5">
          <span>₹0</span>
          <span>₹{filters.maxPrice}</span>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-cocoa-700 mb-3">Availability</p>
        <label className="flex items-center gap-2 text-[11px] text-cocoa-600 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters((f) => ({ ...f, inStockOnly: e.target.checked }))}
            className="accent-caramel-500"
          />
          In Stock Only
        </label>
      </div>
    </aside>
  );
}
