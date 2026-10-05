import { db, json, cors, requireAdmin, requireConfig, slugify } from "../../_lib.js";

function toProduct(doc) {
  const p = doc.data();
  return {
    _id: doc.id,
    id: doc.id,
    ...p,
    category: p.categoryId ? { _id: p.categoryId, id: p.categoryId, name: p.categoryName, slug: p.categorySlug } : null,
  };
}

// PUT: update an existing product's fields (no image re-upload here — the
// create flow's multipart upload stays on POST /api/admin/products; editing
// an existing photo isn't part of this route).
// DELETE: removes the product document outright.
export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    await requireAdmin(req);
    requireConfig();
    const id = req.query.id;
    const ref = db.collection("products").doc(id);

    if (req.method === "PUT") {
      const p = req.body || {};
      if (!p.name || !p.price || !p.categoryId) return json(res, 400, { error: "name, price and categoryId are required" });
      const categoryDoc = await db.collection("categories").doc(p.categoryId).get();
      if (!categoryDoc.exists) return json(res, 400, { error: "Category not found" });
      const category = categoryDoc.data();

      const patch = {
        name: p.name,
        slug: p.slug || slugify(p.name),
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice != null && p.compareAtPrice !== "" ? Number(p.compareAtPrice) : null,
        shortDescription: p.shortDescription || "",
        description: p.description || "",
        imageQuery: p.imageQuery || p.name,
        weights: p.weights || [],
        badges: p.badges || [],
        tags: p.tags || [],
        nutrition: p.nutrition || {},
        inStock: Boolean(p.inStock),
        stockQuantity: Number(p.stockQuantity || 0),
        categoryId: categoryDoc.id,
        categoryName: category.name,
        categorySlug: category.slug,
      };
      await ref.update(patch);
      const updated = await ref.get();
      return json(res, 200, { product: toProduct(updated) });
    }

    if (req.method === "DELETE") {
      await ref.delete();
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
