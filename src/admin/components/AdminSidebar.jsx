import { NavLink, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, MessageSquare, MessagesSquare, PlusCircle, List, ArrowLeft, Megaphone, LogOut } from "lucide-react";
import { logoutUser } from "@/features/auth/authActions";

const ITEMS = [
  { to: "/admin", icon: LayoutDashboard, label: "Sales Dashboard", end: true },
  { to: "/admin/products", icon: List, label: "Products" },
  { to: "/admin/products/new", icon: PlusCircle, label: "Add Product" },
  { to: "/admin/orders", icon: Package, label: "Orders" },
  { to: "/admin/chats", icon: MessagesSquare, label: "Payment Chats" },
  { to: "/admin/messages", icon: MessageSquare, label: "User Messages" },
  { to: "/admin/notifications", icon: Megaphone, label: "News & Offers" },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
  };

  return (
    <aside className="w-full md:w-60 md:shrink-0 bg-ink-900 text-ink-100 md:min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-white/10">
        <h1 className="font-bold text-lg">Ree's Dessertology</h1>
        <p className="text-xs text-ink-400">Admin Dashboard</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-x-auto md:overflow-x-visible flex flex-row md:flex-col gap-1 md:gap-0 md:space-y-1">
        {ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors shrink-0 whitespace-nowrap ${
                isActive ? "bg-accent-500 text-white" : "text-ink-200 hover:bg-white/5"
              }`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="hidden md:block px-3 pb-3 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-200 hover:bg-white/5"
        >
          <ArrowLeft size={18} /> Back to Store
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-200 hover:bg-white/5"
        >
          <LogOut size={18} /> Log Out
        </button>
      </div>
      <div className="hidden md:block px-5 py-4 border-t border-white/10 text-xs text-ink-400">
        Content is stored in Firebase. Privileged actions use the protected serverless API.
      </div>
      {/* Mobile-only compact actions row — the fuller footer above is
          hidden below md since the sidebar itself collapses into a
          horizontal top bar there (see AdminLayout.jsx). */}
      <div className="flex md:hidden items-center gap-2 px-3 pb-3">
        <Link to="/" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-ink-200 hover:bg-white/5 shrink-0">
          <ArrowLeft size={14} /> Store
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-ink-200 hover:bg-white/5 shrink-0">
          <LogOut size={14} /> Log Out
        </button>
      </div>
    </aside>
  );
}
