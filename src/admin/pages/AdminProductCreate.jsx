import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { fetchCategories, createProduct } from "@/admin/services/adminProducts";

const FIELD = "w-full border border-ink-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-500";
const LABEL = "text-sm font-medium text-ink-700 mb-1 block";

const initialState = {
  name: "", slug: "", price: "", compareAtPrice: "",
  categoryId: "", shortDescription: "", description: "",
  weights: "", badges: "", tags: "",
  calories: "", carbs: "", protein: "", fat: "", fiber: "",
  inStock: true, stockQuantity: "",
  imageQuery: "",
};

export default function AdminProductCreate() {
  const [form, setForm] = useState(initialState);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [success, setSuccess] = useState(false);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const mutation = useMutation({
    mutationFn: () => createProduct(form, imageFile),
    onSuccess: () => {
      setSuccess(true);
      setForm(initialState);
      setImageFile(null);
      setImagePreview(null);
      setTimeout(() => setSuccess(false), 4000);
    },
  });

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryId) return;
    mutation.mutate();
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-ink-800 mb-1">Add New Product</h1>
      <p className="text-sm text-ink-400 mb-6">
        Creates and publishes immediately — visible on the storefront right away.
      </p>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
          <CheckCircle2 size={16} /> Product created and published successfully.
        </div>
      )}
      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 text-danger-500 text-sm px-4 py-3 rounded-lg mb-4">
          Failed to create product: {mutation.error?.response?.data?.error?.message || mutation.error?.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Product Name *</label>
            <input required value={form.name} onChange={handleChange("name")} className={FIELD} placeholder="Organic Besan Ladoo" />
          </div>
          <div>
            <label className={LABEL}>Slug (optional — auto-generated if blank)</label>
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

        <div className="border-t border-ink-200 pt-5">
          <label className={LABEL}>Product Photo</label>
          <p className="text-xs text-ink-400 mb-2">
            Upload a photo, or leave blank and it'll be auto-fetched from Unsplash using the search term below
            (falls back to the product name if left blank too).
          </p>

          <div className="flex items-start gap-4">
            <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-ink-200 rounded-lg cursor-pointer hover:border-accent-500 shrink-0 overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <UploadCloud size={22} className="text-ink-400 mb-1" />
                  <span className="text-xs text-ink-400">Upload</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            <div className="flex-1">
              <label className={LABEL}>Unsplash Search Term (used only if no photo uploaded)</label>
              <input
                value={form.imageQuery}
                onChange={handleChange("imageQuery")}
                className={FIELD}
                placeholder="e.g. besan ladoo indian sweet"
                disabled={!!imageFile}
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={mutation.isPending} className="btn-accent w-full py-2.5 disabled:opacity-50">
          {mutation.isPending ? "Creating product…" : "Create & Publish Product"}
        </button>
      </form>
    </div>
  );
}
