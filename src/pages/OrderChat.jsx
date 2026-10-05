import { useParams } from "react-router-dom";
import CustomerOrderChat from "@/components/chat/CustomerOrderChat";

// Dedicated payment-chat page for a customer's QR/UPI order: scan the QR,
// pay, tap "I've paid" and wait here for the admin to confirm. The admin sees
// the very same chat in the Payment Chats inbox (/admin/chats/:id).
export default function OrderChat() {
  const { orderId } = useParams();
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <CustomerOrderChat
        orderNumber={orderId}
        className="h-[calc(100vh-12rem)] min-h-[560px]"
        backTo={`/order/${orderId}/track`}
        backLabel="Back to order"
      />
    </div>
  );
}
