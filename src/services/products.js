import api from "./api";
import { mockProducts, mockCategories, findProductBySlug, findRelatedProducts } from "@/data/mockProducts";

const USE_MOCK = false;

// Public product/category reads go through the server (client/api/products.js
// + client/api/categories.js, both backed by the Firestore Admin SDK) —
// see client/api/products.js for why this isn't a direct client Firestore
// read like the old direct-to-Sanity-CDN pattern was.
export async function fetchProducts({ category, page = 1, pageSize = 12 } = {}) {
  if (USE_MOCK) {
    await wait();
    let items = category ? mockProducts.filter((p) => p.category === category) : mockProducts;
    const start = (page - 1) * pageSize;
    return { data: items.slice(start, start + pageSize), meta: { pagination: { page, pageSize, total: items.length } } };
  }
  const { data } = await api.get("/api/products", { params: { category, page, pageSize } });
  return data;
}

export async function fetchProductBySlug(slug) {
  if (USE_MOCK) {
    await wait();
    return findProductBySlug(slug);
  }
  const { data } = await api.get("/api/products", { params: { slug } });
  return data.product;
}

export async function fetchRelatedProducts(slug, category) {
  if (USE_MOCK) {
    await wait();
    return findRelatedProducts(slug, category);
  }
  const { data } = await api.get("/api/products", { params: { relatedTo: slug, category } });
  return data.products;
}

export async function fetchCategories() {
  if (USE_MOCK) {
    await wait(150);
    return mockCategories;
  }
  const { data } = await api.get("/api/categories");
  return data.categories;
}

export function getCategorySlug(product) {
  const category = product?.category;
  if (!category) return null;
  return typeof category === "string" ? category : category.slug;
}

function wait(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}
