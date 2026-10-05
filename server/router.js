// Single route table for the whole backend. Vercel's Hobby plan allows at most
// 12 serverless functions per deployment, and this API has ~21 endpoints — so
// instead of one function per file, ONE function (api/[...path].js) receives
// every /api/* request and dispatches here. The handlers themselves live in
// client/server/** (outside api/, so Vercel doesn't turn each into its own
// function) and are unchanged.
import authSession from "./auth/session.js";
import categories from "./categories.js";
import products from "./products.js";
import orders from "./orders/index.js";
import orderDeliver from "./orders/[orderNumber]/deliver.js";
import orderMessages from "./orders/[orderNumber]/messages.js";
import orderOne from "./orders/[orderNumber].js";
import adminOrders from "./admin/orders.js";
import adminOrderMessages from "./admin/orders/[id]/messages.js";
import adminOrderOne from "./admin/orders/[id].js";
import feedback from "./feedback.js";
import adminProducts from "./admin/products.js";
import adminSales from "./admin/sales.js";
import notifications from "./notifications.js";
import adminNotifications from "./admin/notifications.js";
import adminNotificationOne from "./admin/notifications/[id].js";
import adminProductOne from "./admin/products/[id].js";
import adminMessages from "./admin/messages.js";
import contact from "./contact.js";
import newsletter from "./newsletter.js";
import stats from "./stats.js";

const ROUTES = [
  { pattern: /^\/api\/auth\/session\/?$/, handler: authSession },
  { pattern: /^\/api\/categories\/?$/, handler: categories },
  { pattern: /^\/api\/products\/?$/, handler: products },
  { pattern: /^\/api\/orders\/?$/, handler: orders },
  { pattern: /^\/api\/orders\/([^/]+)\/deliver\/?$/, handler: orderDeliver, params: ["orderNumber"] },
  { pattern: /^\/api\/orders\/([^/]+)\/messages\/?$/, handler: orderMessages, params: ["orderNumber"] },
  { pattern: /^\/api\/orders\/([^/]+)\/?$/, handler: orderOne, params: ["orderNumber"] },
  { pattern: /^\/api\/admin\/orders\/?$/, handler: adminOrders },
  { pattern: /^\/api\/admin\/orders\/([^/]+)\/messages\/?$/, handler: adminOrderMessages, params: ["id"] },
  { pattern: /^\/api\/admin\/orders\/([^/]+)\/?$/, handler: adminOrderOne, params: ["id"] },
  { pattern: /^\/api\/feedback\/?$/, handler: feedback },
  { pattern: /^\/api\/admin\/products\/?$/, handler: adminProducts },
  { pattern: /^\/api\/admin\/sales\/?$/, handler: adminSales },
  { pattern: /^\/api\/notifications\/?$/, handler: notifications },
  { pattern: /^\/api\/admin\/notifications\/?$/, handler: adminNotifications },
  { pattern: /^\/api\/admin\/notifications\/([^/]+)\/?$/, handler: adminNotificationOne, params: ["id"] },
  { pattern: /^\/api\/admin\/products\/([^/]+)\/?$/, handler: adminProductOne, params: ["id"] },
  { pattern: /^\/api\/admin\/messages\/?$/, handler: adminMessages },
  { pattern: /^\/api\/contact\/?$/, handler: contact },
  { pattern: /^\/api\/newsletter\/?$/, handler: newsletter },
  { pattern: /^\/api\/stats\/?$/, handler: stats },
];

// -> { handler, params } for a pathname like "/api/orders/NM123456/deliver", or null.
export function resolve(pathname) {
  for (const r of ROUTES) {
    const m = pathname.match(r.pattern);
    if (!m) continue;
    const params = {};
    (r.params || []).forEach((name, i) => { params[name] = decodeURIComponent(m[i + 1]); });
    return { handler: r.handler, params };
  }
  return null;
}
