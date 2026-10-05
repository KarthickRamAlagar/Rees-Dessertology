import { ChevronLeft, ChevronRight } from "lucide-react";

// Small, reusable "N per page" control for admin list pages (Products,
// etc). Purely presentational — the page itself still owns
// `page` state and slices its own already-fetched array; this just renders
// the Prev/Next + page-number buttons and reports clicks back up.
//
// totalItems: full count before slicing
// pageSize: items per page (7, per Karthi's request)
// page: current 1-indexed page
// onPageChange: (nextPage) => void
export default function Pagination({ totalItems, pageSize, page, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-ink-100">
      <p className="text-xs text-ink-400">
        Showing {Math.min((page - 1) * pageSize + 1, totalItems)}–{Math.min(page * pageSize, totalItems)} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-ink-200 text-ink-500 disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent-400 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
              p === page
                ? "bg-accent-500 text-white"
                : "border border-ink-200 text-ink-600 hover:border-accent-400"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-ink-200 text-ink-500 disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent-400 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
