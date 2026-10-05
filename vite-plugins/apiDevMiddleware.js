// Dev-only: runs the client/server/** API handlers directly inside
// Vite's own dev server, so `npm run dev` alone is enough locally — no
// `vercel dev` process, no second terminal, and none of the Windows
// UV_HANDLE_CLOSING crashes that came from Vercel CLI wrapping Vite as its
// own dev command.
//
// Production is untouched: Vercel deploys client/api/[...path].js as ONE
// serverless function that dispatches to client/server/**. This file
// lives outside api/, so it is never itself deployed as a function — it
// only runs here, as a Vite plugin, in dev.


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
        // Same route table production uses (server/router.js).
        const router = await server.ssrLoadModule("/server/router.js");
        const route = router.resolve(url.pathname);
        if (!route) return next();

        req.query = { ...Object.fromEntries(url.searchParams.entries()), ...route.params };

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
          await route.handler(req, res);
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
