import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

// Auto-generated breadcrumbs from the current URL. Storefront variant uses the
// cocoa/caramel/cream tokens; the admin variant (AdminLayout) uses ink/accent.
// No breadcrumb on the storefront home page ("/").

const LABELS = {
  shop: "Shop",
  cart: "Cart",
  checkout: "Checkout",
  wishlist: "Wishlist",
  account: "Account",
  contact: "Contact",
  "track-order": "Track Order",
  gifting: "Gifting",
  about: "About",
  login: "Login",
  signup: "Login",
  orders: "Orders",
  faq: "FAQ",
  "shipping-policy": "Shipping Policy",
  returns: "Returns & Refunds",
};

const ADMIN_LABELS = {
  products: "Products",
  new: "New Product",
  edit: "Edit",
  orders: "Orders",
  chats: "Payment Chats",
  messages: "User Messages",
  notifications: "Notifications",
};

const humanize = (slug) =>
  decodeURIComponent(slug)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

function buildStoreCrumbs(segs) {
  const [first, second, third] = segs;

  if (first === "product" && second) {
    return [{ label: "Shop", to: "/shop" }, { label: humanize(second) }];
  }

  if (first === "order" && second) {
    const id = decodeURIComponent(second);
    const base = [{ label: "Orders", to: "/orders" }, { label: `#${id}`, to: `/order/${second}/track` }];
    const tail = { track: "Track", chat: "Payment Chat", success: "Confirmed" }[third];
    return tail ? [...base, { label: tail }] : base;
  }

  if (first === "checkout") {
    return [{ label: "Cart", to: "/cart" }, { label: "Checkout" }];
  }

  return segs.map((seg, i) => ({
    label: LABELS[seg] || humanize(seg),
    to: i < segs.length - 1 ? `/${segs.slice(0, i + 1).join("/")}` : undefined,
  }));
}

function buildAdminCrumbs(segs) {
  // segs[0] === "admin"
  const rest = segs.slice(1);
  if (rest.length === 0) return [{ label: "Dashboard" }];

  const crumbs = [{ label: "Dashboard", to: "/admin" }];
  const [a, b, c] = rest;

  if (a === "products") {
    crumbs.push({ label: "Products", to: b ? "/admin/products" : undefined });
    if (b === "new") crumbs.push({ label: "New Product" });
    else if (b && c === "edit") crumbs.push({ label: "Edit" });
    return crumbs;
  }

  if (a === "chats") {
    crumbs.push({ label: "Payment Chats", to: b ? "/admin/chats" : undefined });
    if (b) crumbs.push({ label: "Chat" });
    return crumbs;
  }

  if (a === "orders") {
    if (b && c === "chat") {
      // Legacy /admin/orders/:id/chat — same screen as /admin/chats/:id
      crumbs.push({ label: "Payment Chats", to: "/admin/chats" }, { label: "Chat" });
    } else {
      crumbs.push({ label: "Orders" });
    }
    return crumbs;
  }

  rest.forEach((seg, i) => {
    crumbs.push({
      label: ADMIN_LABELS[seg] || humanize(seg),
      to: i < rest.length - 1 ? `/admin/${rest.slice(0, i + 1).join("/")}` : undefined,
    });
  });
  return crumbs;
}

export default function Breadcrumbs({ variant = "store" }) {
  const { pathname } = useLocation();
  const segs = pathname.split("/").filter(Boolean);
  const admin = variant === "admin";

  if (!admin && segs.length === 0) return null;

  const crumbs = admin ? buildAdminCrumbs(segs) : buildStoreCrumbs(segs);
  const homeTo = admin ? "/admin" : "/";

  const T = admin
    ? {
        pill: "bg-white/80 border-ink-200 shadow-sm",
        link: "text-ink-400 hover:text-accent-600 hover:bg-ink-100",
        sep: "text-ink-200",
        current: "text-ink-800 bg-accent-500/10",
      }
    : {
        pill: "bg-white/70 dark:bg-[#18120d]/70 border-cream-200/80 dark:border-white/10 shadow-[0_4px_20px_rgba(107,66,38,0.06)] backdrop-blur-md",
        link: "text-cocoa-500 hover:text-caramel-600 hover:bg-caramel-400/10",
        sep: "text-cocoa-400/60",
        current: "text-caramel-700 dark:text-caramel-300 bg-caramel-400/15",
      };

  const nav = (
    <nav aria-label="Breadcrumb" className={`inline-flex max-w-full rounded-full border px-1.5 py-1 ${T.pill}`}>
      <ol className="flex items-center gap-0.5 text-[12px] sm:text-[13px] whitespace-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <li className="shrink-0">
          <Link to={homeTo} aria-label={admin ? "Dashboard home" : "Home"} className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${T.link}`}>
            <Home size={14} />
          </Link>
        </li>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <Fragment key={`${i}-${c.label}`}>
              <li aria-hidden="true" className={`shrink-0 ${T.sep}`}>
                <ChevronRight size={13} />
              </li>
              <li className="shrink-0 min-w-0">
                {c.to && !last ? (
                  <Link to={c.to} title={c.label} className={`block max-w-[8rem] sm:max-w-[14rem] truncate rounded-full px-2.5 py-1 font-medium transition-colors ${T.link}`}>
                    {c.label}
                  </Link>
                ) : (
                  <span
                    title={c.label}
                    aria-current={last ? "page" : undefined}
                    className={`block max-w-[10rem] sm:max-w-[18rem] truncate rounded-full px-2.5 py-1 font-semibold ${last ? T.current : T.link.split(" ")[0]}`}
                  >
                    {c.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );

  if (admin) return <div className="mb-4 flex max-w-full">{nav}</div>;

  return (
    <div className="px-4 md:px-6 pt-3">
      <div className="max-w-7xl mx-auto flex">{nav}</div>
    </div>
  );
}
