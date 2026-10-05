import { db, json, cors, requireAdmin, requireConfig, parseMultipart, uploadFile, uploadUnsplash, slugify } from "../_lib.js";

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
    lowStockAlertAt: p.lowStockAlertAt || null,
    category: p.categoryId ? { _id: p.categoryId, id: p.categoryId, name: p.categoryName, slug: p.categorySlug } : null,
  };
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    await requireAdmin(req);
    requireConfig();

    if (req.method === "GET") {
      const snap = await db.collection("products").orderBy("createdAt", "desc").get();
      return json(res, 200, { products: snap.docs.map(toProduct) });
    }

    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

    const { fields, files } = await parseMultipart(req);
    const raw = Array.isArray(fields.payload) ? fields.payload[0] : fields.payload;
    const p = JSON.parse(raw || "{}");
    if (!p.name || !p.price || !p.categoryId) return json(res, 400, { error: "name, price and categoryId are required" });

    const categoryDoc = await db.collection("categories").doc(p.categoryId).get();
    if (!categoryDoc.exists) return json(res, 400, { error: "Category not found" });
    const category = categoryDoc.data();

    const uploaded = files.image ? await uploadFile(files.image) : await uploadUnsplash(p.imageQuery || p.name);
    const now = new Date().toISOString();

    const doc = {
      name: p.name,
      slug: p.slug || slugify(p.name),
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
      shortDescription: p.shortDescription || "",
      description: p.description || "",
      images: uploaded?.url ? [uploaded.url] : [],
      imageQuery: p.imageQuery || p.name,
      weights: p.weights || [],
      badges: p.badges || [],
      tags: p.tags || [],
      nutrition: p.nutrition || {},
      rating: 0,
      reviewCount: 0,
      inStock: Boolean(p.inStock),
      stockQuantity: Number(p.stockQuantity || 0),
      categoryId: categoryDoc.id,
      categoryName: category.name,
      categorySlug: category.slug,
      createdAt: now,
    };
    const ref = await db.collection("products").add(doc);
    const created = await ref.get();
    return json(res, 201, { product: toProduct(created) });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
