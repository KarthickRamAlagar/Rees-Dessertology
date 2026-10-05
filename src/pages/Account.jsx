import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import AccountSidebar from "@/components/account/AccountSidebar";
import MyOrders from "./MyOrders";
import AdminAccountOrders from "./AdminAccountOrders";
import AccountPaymentChat from "@/components/account/AccountPaymentChat";
import { useMyOrders } from "@/hooks/useMyOrders";
import { fetchNotifications } from "@/services/notifications";
import { markSeen } from "@/lib/seenNotifications";
import { useIsAdmin } from "@/lib/isAdmin";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

// Stable component identity (an inline arrow would remount MyOrders on every Account render).
const CustomerOrders = () => <MyOrders embedded />;

function Notifications() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  // Opening this tab is what counts as "seen" — the toast elsewhere only
  // nudges the person to come look, it never marks anything seen itself.
  useEffect(() => {
    if (notifications?.length) markSeen(notifications.map((n) => n.id));
  }, [notifications]);

  if (isLoading) return <Spinner className="py-10" />;
  if (!notifications?.length) {
    return <EmptyState title="No notifications yet" subtitle="News and offers from us will show up here." />;
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <div key={n.id} className="glass-panel rounded-glass p-4 flex items-start gap-3">
          <Megaphone size={18} className="text-caramel-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-cocoa-800">{n.title}</p>
            <p className="text-sm text-cocoa-500">{n.message}</p>
            <p className="text-xs text-cocoa-400 mt-1">
              {new Date(n._createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Account() {
  const location = useLocation();
  const isAdmin = useIsAdmin();
  const [active, setActive] = useState(["notifications", "chat"].includes(location.state?.tab) ? location.state.tab : "orders");
  // "Payment Chat" only exists for customers who have placed at least one order.
  const { data: myOrders } = useMyOrders({ enabled: !isAdmin });
  const hasOrders = !isAdmin && (myOrders?.length || 0) > 0;

  const SECTIONS = {
    orders: isAdmin ? AdminAccountOrders : CustomerOrders,
    notifications: Notifications,
    chat: AccountPaymentChat,
  };
  const Section = SECTIONS[active === "chat" && !hasOrders ? "orders" : active] || SECTIONS.orders;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-[240px_1fr] gap-8">
      <AccountSidebar active={active} setActive={setActive} />
      <div className="min-w-0">
        <Section />
      </div>
    </div>
  );
}
