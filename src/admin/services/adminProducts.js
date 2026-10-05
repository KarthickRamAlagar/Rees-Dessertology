import adminApi from "./adminApi";

export async function fetchProductsWithBanners() {
  const { data } = await adminApi.get("/api/admin/products");
  return data.products;
}

export async function fetchCategories() {
  const { data } = await adminApi.get("/api/categories");
  return data.categories || [];
}

const split = (v) =>
  Array.isArray(v) ? v.filter(Boolean) : v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];

export async function createProduct(formValues, imageFile) {
  const fd = new FormData();
  const payload = {
    ...formValues,
    price: Number(formValues.price),
    compareAtPrice: formValues.compareAtPrice ? Number(formValues.compareAtPrice) : null,
    stockQuantity: formValues.stockQuantity ? Number(formValues.stockQuantity) : 0,
    categoryId: formValues.categoryId,
    weights: split(formValues.weights),
    badges: split(formValues.badges),
    tags: split(formValues.tags),
    nutrition: {
      calories: formValues.calories ? Number(formValues.calories) : null,
      carbs: formValues.carbs || null,
      protein: formValues.protein || null,
      fat: formValues.fat || null,
      fiber: formValues.fiber || null,
    },
  };
  fd.append("payload", JSON.stringify(payload));
  if (imageFile) fd.append("image", imageFile);
  const { data } = await adminApi.post("/api/admin/products", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.product;
}

export async function fetchProduct(id) {
  const products = await fetchProductsWithBanners();
  return products.find((p) => p.id === id) || null;
}

export async function updateProduct(id, formValues) {
  const payload = {
    ...formValues,
    price: Number(formValues.price),
    compareAtPrice: formValues.compareAtPrice ? Number(formValues.compareAtPrice) : null,
    stockQuantity: formValues.stockQuantity ? Number(formValues.stockQuantity) : 0,
    categoryId: formValues.categoryId,
    weights: split(formValues.weights),
    badges: split(formValues.badges),
    tags: split(formValues.tags),
    nutrition: {
      calories: formValues.calories ? Number(formValues.calories) : null,
      carbs: formValues.carbs || null,
      protein: formValues.protein || null,
      fat: formValues.fat || null,
      fiber: formValues.fiber || null,
    },
  };
  const { data } = await adminApi.put(`/api/admin/products/${encodeURIComponent(id)}`, payload);
  return data.product;
}

export async function deleteProduct(id) {
  await adminApi.delete(`/api/admin/products/${encodeURIComponent(id)}`);
}
