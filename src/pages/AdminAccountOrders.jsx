import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "@/admin/services/adminOrders";
import Pager from "@/components/ui/Pager";

const PAGE_SIZE = 7;

// Shown instead of the customer MyOrders card-list when an admin visits
// their own Account page (see Account.jsx) — same order data the admin
// Orders dashboard uses, just a plain table here. Clicking a row goes to
// that order's existing customer-facing tracking page.
export default function AdminAccountOrders() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["orders", ""],
    queryFn: () => fetchOrders(),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-cocoa-800 mb-6">Orders</h1>

      {isError && <p className="text-berry-500 text-sm mb-4">Could not load orders.</p>}
      {isLoading && <p className="text-sm text-cocoa-500">Loading…</p>}

      {!isLoading && (
        <div className="rounded-xl border border-cream-300 bg-cream-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-cocoa-500 border-b border-cream-300 bg-cream-200">
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((o) => (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/order/${o.orderNumber}/track`)}
                  className="border-b border-cream-300 last:border-0 cursor-pointer hover:bg-cream-200 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-cocoa-800">#{o.orderNumber}</td>
                  <td className="px-4 py-3 text-cocoa-700">{o.userName || o.shippingAddress?.fullName || "—"}</td>
                  <td className="px-4 py-3 text-cocoa-600">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-cocoa-700">{o.status}</td>
                  <td className="px-4 py-3 text-cocoa-700">{o.paymentMethod === "upi" ? "QR / UPI" : o.paymentMethod} · {o.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && orders?.length === 0 && (
            <p className="text-sm text-cocoa-500 text-center py-8">No orders yet.</p>
          )}
        </div>
      )}
      <Pager totalItems={orders?.length || 0} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />
    </div>
  );
}
