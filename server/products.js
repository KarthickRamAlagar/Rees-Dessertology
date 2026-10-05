import { db, json, cors, requireConfig } from "./_lib.js";

// Public — products were previously read straight from Sanity's CDN on the
// client (client/src/lib/sanity.js). Firestore has no public CDN-style
// client read path that avoids needing public security rules on the
// `products` collection, so this project routes public product reads
// through the server (Admin SDK) instead, the same way categories already
// were — see client/src/services/products.js for the caller.
//
// Category docs are denormalized onto each product (categoryId,
// categorySlug, categoryName) at write time (see admin/products.js /
// admin/products/[id].js) so listing/filtering never needs a join.
function toProduct(doc) {
  const p = doc.data();
  return {
    _id: doc.id,
    id: doc.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    shortDescription: p.shortDescription || "",
    description: p.description || "",
    images: p.images || [],
    imageQuery: p.imageQuery || "",
    weights: p.weights || [],
    badges: p.badges || [],
    tags: p.tags || [],
    nutrition: p.nutrition || {},
    rating: p.rating || 0,
    reviewCount: p.reviewCount || 0,
    inStock: Boolean(p.inStock),
    stockQuantity: p.stockQuantity || 0,
    category: p.categoryId ? { _id: p.categoryId, id: p.categoryId, name: p.categoryName, slug: p.categorySlug } : null,
  };
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    requireConfig();
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

    const { category, slug, relatedTo, page = "1", pageSize = "12" } = req.query || {};

    // Single product by slug.
    if (slug) {
      const snap = await db.collection("products").where("slug", "==", slug).limit(1).get();
      if (snap.empty) return json(res, 200, { product: null });
      return json(res, 200, { product: toProduct(snap.docs[0]) });
    }

    // Related products — same category, excluding the current slug.
    if (relatedTo) {
      let q = db.collection("products");
      if (category) q = q.where("categorySlug", "==", category);
      // Sort in memory: where(categorySlug) + orderBy(createdAt) needs a composite index.
      const snap = await q.get();
      const related = snap.docs
        .slice()
        .sort((a, b) => String(b.data().createdAt || "").localeCompare(String(a.data().createdAt || "")))
        .filter((d) => d.data().slug !== relatedTo)
        .slice(0, 4)
        .map(toProduct);
      return json(res, 200, { products: related });
    }

    // Paginated listing.
    const pageNum = Math.max(1, Number(page) || 1);
    const size = Math.min(48, Math.max(1, Number(pageSize) || 12));
    let q = db.collection("products");
    if (category) q = q.where("categorySlug", "==", category);

    // Catalog is small: fetch, sort newest-first and paginate in memory so no
    // composite index is needed when filtering by category.
    const allSnap = await q.get();
    const sorted = allSnap.docs.slice().sort((a, b) => String(b.data().createdAt || "").localeCompare(String(a.data().createdAt || "")));
    const total = sorted.length;
    const data = sorted.slice((pageNum - 1) * size, pageNum * size).map(toProduct);

    return json(res, 200, { data, meta: { pagination: { page: pageNum, pageSize: size, total, pageCount: Math.ceil(total / size) } } });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
