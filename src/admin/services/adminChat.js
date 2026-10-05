import adminApi from "./adminApi";

export async function fetchOrderMessages(orderId) {
  const { data } = await adminApi.get(`/api/admin/orders/${encodeURIComponent(orderId)}/messages`);
  return data;
}

export async function sendTextMessage(orderId, text) {
  const { data } = await adminApi.post(`/api/admin/orders/${encodeURIComponent(orderId)}/messages`, { text });
  return data.message;
}

export async function confirmPayment(orderId) {
  const { data } = await adminApi.put(`/api/admin/orders/${encodeURIComponent(orderId)}`, { paymentStatus: "paid" });
  return data.order;
}

export async function rejectPayment(orderId) {
  const { data } = await adminApi.put(`/api/admin/orders/${encodeURIComponent(orderId)}`, { paymentStatus: "failed" });
  return data.order;
}
