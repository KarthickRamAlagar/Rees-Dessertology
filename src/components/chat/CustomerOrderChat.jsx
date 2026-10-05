import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import OrderChatRoom from "@/components/chat/OrderChatRoom";
import { fetchOrderMessages, sendTextMessage, sendPaymentNotice } from "@/services/chat";
import { selectUser } from "@/store/authSlice";

// Customer-side wiring of OrderChatRoom for ONE order (by order number).
// Used by the dedicated /order/:orderId/chat page and by the Account page's
// "Payment Chat" section. The signed-in uid is part of the query key so
// switching accounts never shows another account's chat.
export default function CustomerOrderChat({ orderNumber, className, backTo, backLabel, asideFrom }) {
  const queryClient = useQueryClient();
  const uid = useSelector(selectUser)?.uid;

  return (
    <OrderChatRoom
      key={orderNumber}
      className={className}
      queryKey={["order-chat", uid, orderNumber]}
      fetchMessages={() => fetchOrderMessages(orderNumber)}
      sendText={(text) => sendTextMessage(orderNumber, text)}
      sendPaymentNotice={() => sendPaymentNotice(orderNumber)}
      // A payment notice flips the order to pending — refresh anything that shows it.
      onChanged={() => {
        queryClient.invalidateQueries({ queryKey: ["my-orders"] });
        queryClient.invalidateQueries({ queryKey: ["order"] });
      }}
      backTo={backTo}
      backLabel={backLabel}
      asideFrom={asideFrom}
    />
  );
}
