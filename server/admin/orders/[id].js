import { db, json, cors, requireAdmin, requireConfig, deleteChat } from "../../_lib.js";

const statuses = new Set(["placed", "packed", "shipped", "outForDelivery", "delivered", "cancelled"]);
// Forward-only sequence — an order's status can only move to the same
// status, something later in this list, or "cancelled" (handled
// separately, always allowed from a non-terminal state).
const FORWARD_ORDER = ["placed", "packed", "shipped", "outForDelivery", "delivered"];
const paymentStatuses = new Set(["pending", "paid", "failed", "refunded"]);

export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    await requireAdmin(req);
    requireConfig();
    if (req.method !== "PUT") return json(res, 405, { error: "Method not allowed" });
    const { status, shippingDetails, paymentStatus } = req.body || {};
    if (status != null && !statuses.has(status)) return json(res, 400, { error: "Invalid order status" });
    if (paymentStatus != null && !paymentStatuses.has(paymentStatus)) return json(res, 400, { error: "Invalid payment status" });

    const id = req.query.id;
    const ref = db.collection("orders").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return json(res, 404, { error: "Order not found" });
    const old = snap.data();
    const patch = {};

    if (status != null) {
      // Reject any status move that would go backward in the forward
      // sequence — "cancelled" stays allowed from any non-terminal status.
      const fromIdx = FORWARD_ORDER.indexOf(old.status);
      const toIdx = FORWARD_ORDER.indexOf(status);
      if (status !== "cancelled" && fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx) {
        return json(res, 400, { error: `Order status cannot move backward from "${old.status}" to "${status}".` });
      }
      const history = [...(old.statusHistory || []), { step: status, timestamp: new Date().toISOString() }];
      patch.status = status;
      patch.statusHistory = history;
    }

    // Vendor/courier + support contact — the admin fills this in only when
    // marking an order Shipped. Keep whatever was saved before if this
    // request didn't send new details (e.g. a later status change past
    // "shipped").
    if (shippingDetails && (shippingDetails.vendorName || shippingDetails.vendorContact || shippingDetails.supportEmail)) {
      patch.shippingDetails = {
        vendorName: shippingDetails.vendorName || "",
        vendorContact: shippingDetails.vendorContact || "",
        supportEmail: shippingDetails.supportEmail || "",
      };
    }

    // Admin payment decision — "Payment received" (paid) / "Not received"
    // (failed), triggered from a customer's payment_notice card in the chat
    // inbox, from the chat side panel, or from the plain button in
    // AdminOrders.jsx. "paid" also kicks off the 2-day feedback window for
    // QR orders.
    if (paymentStatus != null) {
      patch.paymentStatus = paymentStatus;
      if (paymentStatus === "paid" && old.paymentMethod === "upi" && old.feedbackStatus == null) {
        patch.feedbackStatus = "awaiting";
        patch.feedbackDeadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
      }
      const decided = paymentStatus === "paid" ? "confirmed" : paymentStatus === "failed" ? "rejected" : null;
      if (decided) {
        if (old.paymentNotice) patch["paymentNotice.status"] = decided;
        if (old.payment) patch["payment.status"] = decided; // legacy UTR-proof orders
      }
    }

    if (Object.keys(patch).length === 0) return json(res, 400, { error: "Nothing to update" });
    await ref.update(patch);

    // Drop a system message into the chat thread so the customer sees why
    // their payment status changed, right where they tapped "I've paid".
    if (paymentStatus === "paid" || paymentStatus === "failed") {
      await ref.collection("messages").add({
        type: "system",
        text: paymentStatus === "paid"
          ? "Payment confirmed by Ree's Dessertology."
          : "Payment not received yet — if you've already paid, wait a moment and tap \"I've paid\" again.",
        sender: { kind: "admin", name: "Ree's Dessertology" },
        createdAt: new Date().toISOString(),
      });
      // Settle every still-pending notice bubble in the thread (new
      // payment_notice and legacy "payment" proofs), so the action buttons
      // disappear and both sides see the result.
      const decidedStatus = paymentStatus === "paid" ? "confirmed" : "rejected";
      const msgSnap = await ref.collection("messages").get();
      await Promise.all(
        msgSnap.docs
          .filter((d) => ["payment_notice", "payment"].includes(d.data().type) && d.data().status === "pending")
          .map((d) => d.ref.update({ status: decidedStatus }))
      );
    }

    // Order delivered -> the cycle is over, so delete the chat to save storage.
    if (status === "delivered") await deleteChat(ref);

    const updated = await ref.get();
    return json(res, 200, { order: { _id: updated.id, id: updated.id, ...updated.data() } });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
