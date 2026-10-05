// Dev-only: runs the client/api/** serverless functions directly inside
// Vite's own dev server, so `npm run dev` alone is enough locally — no
// `vercel dev` process, no second terminal, and none of the Windows
// UV_HANDLE_CLOSING crashes that came from Vercel CLI wrapping Vite as its
// own dev command.
//
// Production is untouched: Vercel still deploys everything under
// client/api/** as real serverless functions exactly as before. This file
// lives outside api/, so it is never itself deployed as a function — it
// only runs here, as a Vite plugin, in dev.

const ROUTES = [
  { pattern: /^\/api\/auth\/session\/?$/, file: "/api/auth/session.js" },
  { pattern: /^\/api\/categories\/?$/, file: "/api/categories.js" },
  { pattern: /^\/api\/products\/?$/, file: "/api/products.js" },
  { pattern: /^\/api\/orders\/?$/, file: "/api/orders/index.js" },
  { pattern: /^\/api\/orders\/([^/]+)\/deliver\/?$/, file: "/api/orders/[orderNumber]/deliver.js", params: ["orderNumber"] },
  { pattern: /^\/api\/orders\/([^/]+)\/messages\/?$/, file: "/api/orders/[orderNumber]/messages.js", params: ["orderNumber"] },
  { pattern: /^\/api\/orders\/([^/]+)\/?$/, file: "/api/orders/[orderNumber].js", params: ["orderNumber"] },
  { pattern: /^\/api\/admin\/orders\/?$/, file: "/api/admin/orders.js" },
  { pattern: /^\/api\/admin\/orders\/([^/]+)\/messages\/?$/, file: "/api/admin/orders/[id]/messages.js", params: ["id"] },
  { pattern: /^\/api\/admin\/orders\/([^/]+)\/?$/, file: "/api/admin/orders/[id].js", params: ["id"] },
  { pattern: /^\/api\/feedback\/?$/, file: "/api/feedback.js" },
  { pattern: /^\/api\/admin\/products\/?$/, file: "/api/admin/products.js" },
  { pattern: /^\/api\/admin\/sales\/?$/, file: "/api/admin/sales.js" },
  { pattern: /^\/api\/notifications\/?$/, file: "/api/notifications.js" },
  { pattern: /^\/api\/admin\/notifications\/?$/, file: "/api/admin/notifications.js" },
  { pattern: /^\/api\/admin\/notifications\/([^/]+)\/?$/, file: "/api/admin/notifications/[id].js", params: ["id"] },
  { pattern: /^\/api\/admin\/products\/([^/]+)\/?$/, file: "/api/admin/products/[id].js", params: ["id"] },
  { pattern: /^\/api\/admin\/messages\/?$/, file: "/api/admin/messages.js" },
  { pattern: /^\/api\/contact\/?$/, file: "/api/contact.js" },
  { pattern: /^\/api\/newsletter\/?$/, file: "/api/newsletter.js" },
  { pattern: /^\/api\/stats\/?$/, file: "/api/stats.js" },
];

// Vercel's Node runtime augments the plain http.ServerResponse with
// .status()/.json() (chainable) — plain Vite/connect doesn't have these, so
// every api/** handler (which calls res.status(...).setHeader(...).json(...))
// needs them polyfilled here to run unmodified.
function enhanceResponse(res) {
  const nativeSetHeader = res.setHeader.bind(res);
  res.setHeader = (name, value) => {
    nativeSetHeader(name, value);
    return res;
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    if (!res.getHeader("Content-Type")) nativeSetHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
    return res;
  };
  return res;
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export function apiDevMiddleware() {
  return {
    name: "api-dev-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/")) return next();

        const url = new URL(req.url, "http://localhost");
        const route = ROUTES.find((r) => r.pattern.test(url.pathname));
        if (!route) return next();

        const match = url.pathname.match(route.pattern);
        req.query = Object.fromEntries(url.searchParams.entries());
        if (route.params) {
          route.params.forEach((name, i) => {
            req.query[name] = decodeURIComponent(match[i + 1]);
          });
        }

        // Vercel's runtime pre-parses a JSON body into req.body. Multipart
        // (product image upload) must stay untouched — api/admin/products.js
        // reads that raw stream itself via formidable, and consuming it here
        // first would leave nothing for formidable to read.
        const contentType = req.headers["content-type"] || "";
        if (req.method !== "GET" && req.method !== "OPTIONS") {
          if (contentType.includes("application/json")) {
            const raw = await readRawBody(req);
            try {
              req.body = raw.length ? JSON.parse(raw.toString("utf8")) : {};
            } catch {
              req.body = {};
            }
          } else if (!contentType.includes("multipart/form-data")) {
            req.body = {};
          }
        }

        enhanceResponse(res);

        try {
          // Goes through Vite's own module graph, so edits to api/** files
          // are picked up the same way the rest of the app hot-reloads —
          // no restart needed.
          const mod = await server.ssrLoadModule(route.file);
          await mod.default(req, res);
        } catch (err) {
          console.error(`[api-dev-middleware] ${req.method} ${req.url} failed:`, err);
          if (!res.headersSent) {
            res.status(err.statusCode || 500).setHeader("Content-Type", "application/json").json({
              error: err.message || "Internal server error",
            });
          }
        }
      });
    },
  };
}
