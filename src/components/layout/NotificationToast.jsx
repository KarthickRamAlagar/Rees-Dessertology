import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useIsAuthenticated } from "@/features/auth/authStore";
import { fetchNotifications } from "@/services/notifications";
import { getUnseen } from "@/lib/seenNotifications";

const RECHECK_MS = 15 * 60 * 1000; // re-show every 15 min while still unseen
const AUTO_HIDE_MS = 6000;

// A toast only nudges the person to go look — it never marks anything seen
// itself. Only actually opening the Notifications tab (Account.jsx) does
// that, so this keeps re-appearing every 15 minutes until they do.
export default function NotificationToast() {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: isAuthenticated,
    refetchInterval: RECHECK_MS,
  });

  const check = useCallback(() => {
    if (!isAuthenticated) return;
    const unseen = getUnseen(notifications);
    if (unseen.length > 0) setVisible(true);
  }, [isAuthenticated, notifications]);

  useEffect(() => {
    if (!notifications) return;
    check();
    const interval = setInterval(check, RECHECK_MS);
    return () => clearInterval(interval);
  }, [notifications, check]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  const handleClick = () => {
    setVisible(false);
    navigate("/account", { state: { tab: "notifications" } });
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-[60] pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.button
            type="button"
            onClick={handleClick}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="pointer-events-auto glass-panel-dark rounded-xl px-4 py-3 flex items-center gap-2.5 text-white shadow-lg max-w-xs text-left"
          >
            <Bell size={18} className="text-caramel-300 shrink-0" />
            <span className="text-sm font-medium">You have a notification from Reena!</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
