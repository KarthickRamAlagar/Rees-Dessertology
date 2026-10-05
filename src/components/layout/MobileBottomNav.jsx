import { NavLink } from "react-router-dom";
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react";
import { useCartStore } from "@/features/cart/cartStore";

const ITEMS = [
  { to: "/", icon: Home, label: "Home", end: true },
  { to: "/shop", icon: Search, label: "Shop" },
  { to: "/cart", icon: ShoppingBag, label: "Cart" },
  { to: "/wishlist", icon: Heart, label: "Wishlist" },
  { to: "/account", icon: User, label: "Account" },
];

export default function MobileBottomNav() {
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-cream-200/60 flex justify-around py-2">
      {ITEMS.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[11px] px-2 relative ${
              isActive ? "text-caramel-600" : "text-cocoa-400"
            }`
          }
        >
          <div className="relative">
            <Icon size={20} />
            {label === "Cart" && totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-caramel-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
