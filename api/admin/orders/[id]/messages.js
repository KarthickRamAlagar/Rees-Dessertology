import { db, json, cors, requireAdmin, requireConfig } from "../../../_lib.js";

// Admin side of the per-order payment chat. GET reads the same thread the
// customer sees (api/orders/[orderNumber]/messages.js); POST lets the admin
// send a plain text reply. Confirming/rejecting a payment-proof message is
// NOT done here — that's the existing paymentStatus PUT in
// api/admin/orders/[id].js (triggered inline from the payment-proof bubble
// in the chat UI), which also appends the "Payment confirmed/rejected"
// system message this thread then shows.
export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    await requireAdmin(req);
    requireConfig();
    const id = req.query.id;
    const orderRef = db.collection("orders").doc(id);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return json(res, 404, { error: "Order not found" });

    if (req.method === "GET") {
      const msgSnap = await orderRef.collection("messages").orderBy("createdAt", "asc").get();
      const messages = msgSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return json(res, 200, { messages, order: { id: orderSnap.id, ...orderSnap.data() } });
    }

    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
    const { text = "" } = req.body || {};
    if (!text.trim()) return json(res, 400, { error: "Message text is required" });

    const now = new Date().toISOString();
    const message = { type: "text", text: text.trim(), sender: { kind: "admin", name: "Ree's Dessertology" }, createdAt: now };
    const ref = await orderRef.collection("messages").add(message);
    return json(res, 201, { message: { id: ref.id, ...message } });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
