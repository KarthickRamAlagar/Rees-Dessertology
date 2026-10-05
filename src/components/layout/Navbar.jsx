import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, User, ShoppingBag, Heart, LayoutDashboard, LogOut } from "lucide-react";
import { useCartStore } from "@/features/cart/cartStore";
import { useIsAuthenticated, useAuthStore } from "@/features/auth/authStore";
import { useIsAdmin } from "@/lib/isAdmin";
import JarLogo from "@/components/ui/JarLogo";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { t } = useTranslation();
  const totalItems = useCartStore((s) => s.totalItems());
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const initial = (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `relative px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
      isActive
        ? "bg-caramel-400/20 text-caramel-700 dark:text-caramel-300"
        : "text-cocoa-700 hover:text-caramel-600"
    }`;

  return (
    <header className="sticky top-0 z-50 px-4 md:px-6 pt-3">
      <nav className="max-w-7xl mx-auto rounded-2xl border border-cream-200/70 dark:border-white/10 bg-white/80 dark:bg-[#18120d]/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(107,66,38,0.07)]">
        <div className="flex items-center justify-between px-4 md:px-6 py-2.5">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="h-10 w-10 rounded-xl bg-caramel-400/10 border border-caramel-400/25 flex items-center justify-center text-caramel-600 dark:text-caramel-300 group-hover:bg-caramel-400/20 transition-colors">
              <JarLogo size={24} />
            </span>
            <span className="leading-none">
              <span className="block font-script text-[25px] text-caramel-600 dark:text-caramel-300">
                Ree's
              </span>
              <span className="block font-display text-[11px] font-semibold tracking-[0.14em] text-cocoa-700 dark:text-cocoa-700">
                Dessertology
              </span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            <NavLink to="/" end className={navLinkClass}>{t("nav.home")}</NavLink>
            <NavLink to="/shop" className={navLinkClass}>{t("nav.shop")}</NavLink>
            <NavLink to="/about" className={navLinkClass}>{t("nav.about")}</NavLink>
            {!isAdmin && (
              <NavLink to="/contact" className={navLinkClass}>{t("nav.contact")}</NavLink>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-caramel-600 hover:text-caramel-700 font-semibold"
              >
                <LayoutDashboard size={15} /> Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            {!isAdmin && (
              <button
                aria-label="Search"
                className="h-9 w-9 rounded-full flex items-center justify-center text-cocoa-600 hover:bg-caramel-400/10 hover:text-caramel-600 transition-colors"
              >
                <Search size={18} />
              </button>
            )}
            {!isAdmin && (
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="h-9 w-9 rounded-full hidden sm:flex items-center justify-center text-cocoa-600 hover:bg-caramel-400/10 hover:text-caramel-600 transition-colors"
              >
                <Heart size={18} />
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                aria-label="Dashboard"
                className="md:hidden h-9 w-9 rounded-full flex items-center justify-center text-caramel-600 hover:bg-caramel-400/10 transition-colors"
              >
                <LayoutDashboard size={18} />
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  aria-label="Account"
                  title={user?.email}
                  className="flex items-center gap-2 rounded-full pr-0 lg:pr-3 hover:bg-caramel-400/10 transition-colors"
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-9 w-9 rounded-full object-cover border border-caramel-400/30"
                    />
                  ) : (
                    <span className="h-9 w-9 rounded-full flex items-center justify-center bg-caramel-400/20 text-caramel-700 text-sm font-semibold">
                      {initial}
                    </span>
                  )}
                  <span className="hidden lg:block max-w-[120px] truncate text-[13px] font-medium text-cocoa-700">
                    {user?.name}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Log out"
                  title="Log out"
                  className="h-9 w-9 rounded-full flex items-center justify-center text-cocoa-600 hover:bg-caramel-400/10 hover:text-caramel-600 transition-colors"
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                aria-label="Log in"
                className="h-9 w-9 rounded-full flex items-center justify-center text-cocoa-600 hover:bg-caramel-400/10 hover:text-caramel-600 transition-colors"
              >
                <User size={18} />
              </Link>
            )}
            {!isAdmin && (
              <Link
                to="/cart"
                aria-label="Cart"
                className="relative h-9 w-9 rounded-full flex items-center justify-center text-cocoa-600 hover:bg-caramel-400/10 hover:text-caramel-600 transition-colors"
              >
                <ShoppingBag size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-caramel-500 text-white text-[9px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center border-2 border-white dark:border-[#18120d]">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
