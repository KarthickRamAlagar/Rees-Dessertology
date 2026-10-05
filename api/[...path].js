// The ONLY serverless function. Every /api/* request lands here and is
// dispatched by server/router.js — see the note at the top of that file for why
// (Vercel Hobby = max 12 functions per deployment).
import { resolve } from "../server/router.js";

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const route = resolve(url.pathname);
  if (!route) {
    res.status(404).setHeader("Content-Type", "application/json").json({ error: "Not found" });
    return;
  }
  // Keep Vercel's parsed query-string values and add the path params
  // (orderNumber / id) the handlers read from req.query.
  req.query = { ...Object.fromEntries(url.searchParams.entries()), ...route.params };
  return route.handler(req, res);
}
