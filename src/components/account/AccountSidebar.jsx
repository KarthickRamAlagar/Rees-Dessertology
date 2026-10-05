import { Package, Bell, LogOut, MessageCircle } from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { useIsAdmin } from "@/lib/isAdmin";
import { useNavigate } from "react-router-dom";
import { useMyOrders } from "@/hooks/useMyOrders";

export default function AccountSidebar({ active, setActive }) {
  const { user, logout } = useAuthStore();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  // The Payment Chat item only appears once the customer has placed an order
  // (same cached query MyOrders uses); admins never see it.
  const { data: myOrders } = useMyOrders({ enabled: !isAdmin });
  const hasOrders = !isAdmin && (myOrders?.length || 0) > 0;

  // Admin sees an "Orders" item (renders the all-orders table in
  // Account.jsx) and no Notifications item at all.
  const ITEMS = isAdmin
    ? [{ key: "orders", label: "Orders", icon: Package }]
    : [
        { key: "orders", label: "My Orders", icon: Package },
        ...(hasOrders ? [{ key: "chat", label: "Payment Chat", icon: MessageCircle }] : []),
        { key: "notifications", label: "Notifications", icon: Bell },
      ];

  return (
    <aside className="glass-panel rounded-glass p-4 h-fit">
      <div className="px-2 pb-4 mb-2 border-b border-cream-200">
        <p className="text-sm text-cocoa-500">Hello,</p>
        <p className="font-semibold text-cocoa-800">{user?.name || "Guest"}</p>
        <p className="text-xs text-cocoa-400">{user?.email || "Not logged in"}</p>
      </div>
      <nav className="space-y-1">
        {ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              active === key ? "bg-caramel-500 text-white font-medium shadow-sm" : "text-cocoa-600 hover:bg-cream-100"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
        <button
          onClick={async () => { await logout(); navigate("/"); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-berry-500 hover:bg-berry-500/10 mt-2"
        >
          <LogOut size={16} /> Logout
        </button>
      </nav>
    </aside>
  );
}
