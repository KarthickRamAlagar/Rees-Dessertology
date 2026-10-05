import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { fetchMyOrders } from "@/services/orders";
import { selectUser } from "@/store/authSlice";

// The signed-in customer's orders (GET /api/orders?mine=1). The uid is part
// of the query key so switching accounts can never show another user's cache.
export function useMyOrders({ enabled = true } = {}) {
  const user = useSelector(selectUser);
  return useQuery({
    queryKey: ["my-orders", user?.uid],
    queryFn: fetchMyOrders,
    enabled: enabled && Boolean(user?.uid),
  });
}
