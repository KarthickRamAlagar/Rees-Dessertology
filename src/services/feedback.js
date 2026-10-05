import api from "./api";

// Asks the server whether the SIGNED-IN user (identified by their ID token,
// not by anything stored in this browser) has a past order that is "awaiting
// feedback" with its 2-day deadline already passed — used to block a new
// order on the Checkout page until that feedback is submitted.
export async function fetchBlockingFeedbackOrder() {
  const { data } = await api.get("/api/feedback");
  return data.blocking || null;
}

export async function submitFeedback(orderNumber, { packing, safeDelivery, taste, comment }) {
  const { data } = await api.post("/api/feedback", { orderNumber, packing, safeDelivery, taste, comment });
  return data;
}
