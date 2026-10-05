import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ImageOff, Pencil, Trash2 } from "lucide-react";
import { fetchProductsWithBanners, deleteProduct } from "@/admin/services/adminProducts";
import Pagination from "@/admin/components/Pagination";

const PAGE_SIZE = 7;

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["products-list"],
    queryFn: fetchProductsWithBanners,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products-list"] }),
  });

  const handleDelete = (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(product.id);
  };

  const [page, setPage] = useState(1);
  const totalItems = products?.length || 0;
  const pagedProducts = products?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-800">Products</h1>
          <p className="text-sm text-ink-400 mt-1">
            Manage storefront products through this dashboard
          </p>
        </div>
        <Link to="/admin/products/new" className="btn-accent flex items-center gap-2">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {isError && <p className="text-danger-500 text-sm">Could not load products.</p>}
      {isLoading && <p className="text-sm text-ink-400">Loading…</p>}

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-ink-400 border-b border-ink-200">
              <th className="px-4 py-3 font-medium">Photo</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedProducts?.map((p) => {
              // Firestore stores images as a plain array of Firebase
              // Storage download URLs — no asset-reference object to build
              // a URL from, so just guard against an empty/missing string.
              const img = p.images?.[0];
              const hasValidImage = typeof img === "string" && img.trim().length > 0;
              return (
                <tr key={p.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3">
                    {hasValidImage ? (
                      <img src={img} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-ink-100 flex items-center justify-center text-ink-400">
                        <ImageOff size={14} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink-800">{p.name}</td>
                  <td className="px-4 py-3 text-ink-500">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3 text-ink-700">₹{p.price}</td>
                  <td className="px-4 py-3">
                    <span className={p.inStock ? "text-success-500" : "text-danger-500"}>
                      {p.inStock ? `${p.stockQuantity ?? "In stock"}` : "Out of stock"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        title="Edit"
                        className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-100"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={deleteMutation.isPending}
                        title="Delete"
                        className="p-1.5 rounded-lg text-danger-500 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {!isLoading && products?.length === 0 && (
          <p className="text-sm text-ink-400 text-center py-8">No products yet — add your first one above.</p>
        )}

        <Pagination totalItems={totalItems} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />
      </div>
    </div>
  );
}
