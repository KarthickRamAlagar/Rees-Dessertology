import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { fetchCategories, fetchProduct, updateProduct } from "@/admin/services/adminProducts";

const FIELD = "w-full border border-ink-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-500";
const LABEL = "text-sm font-medium text-ink-700 mb-1 block";

const emptyState = {
  name: "", slug: "", price: "", compareAtPrice: "",
  categoryId: "", shortDescription: "", description: "",
  weights: "", badges: "", tags: "",
  calories: "", carbs: "", protein: "", fat: "", fiber: "",
  inStock: true, stockQuantity: "",
  imageQuery: "",
};

export default function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyState);
  const [success, setSuccess] = useState(false);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name || "",
      slug: product.slug || "",
      price: product.price ?? "",
      compareAtPrice: product.compareAtPrice ?? "",
      categoryId: product.category?.id || "",
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      weights: (product.weights || []).join(", "),
      badges: (product.badges || []).join(", "),
      tags: (product.tags || []).join(", "),
      calories: product.nutrition?.calories ?? "",
      carbs: product.nutrition?.carbs ?? "",
      protein: product.nutrition?.protein ?? "",
      fat: product.nutrition?.fat ?? "",
      fiber: product.nutrition?.fiber ?? "",
      inStock: product.inStock ?? true,
      stockQuantity: product.stockQuantity ?? "",
      imageQuery: product.imageQuery || "",
    });
  }, [product]);

  const mutation = useMutation({
    mutationFn: () => updateProduct(id, form),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => navigate("/admin/products"), 1200);
    },
  });

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryId) return;
    mutation.mutate();
  };

  if (isLoading) return <p className="text-sm text-ink-400">Loading…</p>;

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-ink-800 mb-1">Edit Product</h1>
      <p className="text-sm text-ink-400 mb-6">
        Changes publish immediately to the storefront.
      </p>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
          <CheckCircle2 size={16} /> Product updated successfully.
        </div>
      )}
      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 text-danger-500 text-sm px-4 py-3 rounded-lg mb-4">
          Failed to update product: {mutation.error?.response?.data?.error?.message || mutation.error?.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Product Name *</label>
            <input required value={form.name} onChange={handleChange("name")} className={FIELD} placeholder="Organic Besan Ladoo" />
          </div>
          <div>
            <label className={LABEL}>Slug</label>
            <input value={form.slug} onChange={handleChange("slug")} className={FIELD} placeholder="organic-besan-ladoo" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={LABEL}>Price (₹) *</label>
            <input required type="number" value={form.price} onChange={handleChange("price")} className={FIELD} placeholder="449" />
          </div>
          <div>
            <label className={LABEL}>Compare-at Price (₹)</label>
            <input type="number" value={form.compareAtPrice} onChange={handleChange("compareAtPrice")} className={FIELD} placeholder="549" />
          </div>
          <div>
            <label className={LABEL}>Category *</label>
            <select required value={form.categoryId} onChange={handleChange("categoryId")} className={FIELD}>
              <option value="">Select category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={LABEL}>Short Description</label>
          <input value={form.shortDescription} onChange={handleChange("shortDescription")} className={FIELD} placeholder="One-line summary shown on product cards" />
        </div>

        <div>
          <label className={LABEL}>Full Description</label>
          <textarea rows={3} value={form.description} onChange={handleChange("description")} className={FIELD} placeholder="Detailed description shown on the product page" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={LABEL}>Weights (comma-separated)</label>
            <input value={form.weights} onChange={handleChange("weights")} className={FIELD} placeholder="250g, 500g, 1kg" />
          </div>
          <div>
            <label className={LABEL}>Badges (comma-separated)</label>
            <input value={form.badges} onChange={handleChange("badges")} className={FIELD} placeholder="100% Organic, No Sugar" />
          </div>
          <div>
            <label className={LABEL}>Tags (comma-separated)</label>
            <input value={form.tags} onChange={handleChange("tags")} className={FIELD} placeholder="Bestseller, Organic" />
          </div>
        </div>

        <div>
          <label className={LABEL}>Nutrition (per 100g)</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <input value={form.calories} onChange={handleChange("calories")} className={FIELD} placeholder="Calories" />
            <input value={form.carbs} onChange={handleChange("carbs")} className={FIELD} placeholder="Carbs e.g. 38g" />
            <input value={form.protein} onChange={handleChange("protein")} className={FIELD} placeholder="Protein" />
            <input value={form.fat} onChange={handleChange("fat")} className={FIELD} placeholder="Fat" />
            <input value={form.fiber} onChange={handleChange("fiber")} className={FIELD} placeholder="Fiber" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className={LABEL}>Stock Quantity</label>
            <input type="number" value={form.stockQuantity} onChange={handleChange("stockQuantity")} className={FIELD} placeholder="40" />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-700 pb-2">
            <input type="checkbox" checked={form.inStock} onChange={handleChange("inStock")} />
            In stock
          </label>
        </div>

        <div>
          <label className={LABEL}>Unsplash Search Term</label>
          <input value={form.imageQuery} onChange={handleChange("imageQuery")} className={FIELD} placeholder="e.g. besan ladoo indian sweet" />
        </div>

        <button type="submit" disabled={mutation.isPending} className="btn-accent w-full py-2.5 disabled:opacity-50">
          {mutation.isPending ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
