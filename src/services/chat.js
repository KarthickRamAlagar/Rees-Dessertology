import api from "./api";

// Customer side of the per-order payment chat. Polled with react-query's
// refetchInterval (see OrderChatRoom.jsx) rather than a Firestore
// onSnapshot listener — every order read/write goes through client/api/**
// on the Admin SDK (signed-in user's ID token attached by services/api.js).
export async function fetchOrderMessages(orderNumber) {
  const { data } = await api.get(`/api/orders/${encodeURIComponent(orderNumber)}/messages`);
  return data;
}

export async function sendTextMessage(orderNumber, text) {
  const { data } = await api.post(`/api/orders/${encodeURIComponent(orderNumber)}/messages`, { type: "text", text });
  return data.message;
}

// "I've paid ₹X" — the body carries nothing but the type; the server fills in
// customer name, order number and amount from the order itself.
export async function sendPaymentNotice(orderNumber) {
  const { data } = await api.post(`/api/orders/${encodeURIComponent(orderNumber)}/messages`, { type: "payment_notice" });
  return data.message;
}
