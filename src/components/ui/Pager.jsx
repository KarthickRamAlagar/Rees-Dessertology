import { ChevronLeft, ChevronRight } from "lucide-react";

// Storefront pager (theme-aware: uses cream/cocoa/caramel tokens, so it reads
// correctly in both light and dark mode). The page owns `page` state and
// slices its own array; this only renders Prev / numbers / Next.
export default function Pager({ totalItems, pageSize, page, onPageChange, className = "" }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;
  const btn = "h-8 min-w-8 px-2 flex items-center justify-center rounded-lg text-xs font-medium border transition-colors";
  return (
    <div className={`flex items-center justify-between gap-3 flex-wrap pt-4 ${className}`}>
      <p className="text-xs text-cocoa-500">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onPageChange(page - 1)}
          className={`${btn} border-cream-300 text-cocoa-600 hover:border-caramel-500 disabled:opacity-40 disabled:cursor-not-allowed`}>
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button key={p} type="button" onClick={() => onPageChange(p)}
            className={`${btn} ${p === page ? "bg-caramel-500 border-caramel-500 text-white" : "border-cream-300 text-cocoa-600 hover:border-caramel-500"}`}>
            {p}
          </button>
        ))}
        <button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}
          className={`${btn} border-cream-300 text-cocoa-600 hover:border-caramel-500 disabled:opacity-40 disabled:cursor-not-allowed`}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
