import adminApi from "./adminApi";

export async function fetchOrders({ status } = {}) {
  const { data } = await adminApi.get("/api/admin/orders", { params: status ? { status } : {} });
  return data.orders;
}

export async function updateOrderStatus(id, status, shippingDetails) {
  const { data } = await adminApi.put(`/api/admin/orders/${encodeURIComponent(id)}`, { status, shippingDetails });
  return data.order;
}

export async function confirmOrderPayment(id) {
  const { data } = await adminApi.put(`/api/admin/orders/${encodeURIComponent(id)}`, { paymentStatus: "paid" });
  return data.order;
}
