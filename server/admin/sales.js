import { db, json, cors, requireAdmin, requireConfig } from "../_lib.js";

// NOTE: this used to read from a separate "salesSummary" document type that
// was meant to be kept up to date by a cron job / webhook in Sanity. That
// job was never actually built, so salesSummary never got written to and
// the dashboard always showed empty. This version computes the numbers
// directly from the real "order" documents every time, so it is always
// correct and needs no background job at all.
export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    await requireAdmin(req);
    requireConfig();
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

    const { from, to } = req.query || {};
    let q = db.collection("orders");
    if (from) q = q.where("createdAt", ">=", `${from}T00:00:00.000Z`);
    if (to) q = q.where("createdAt", "<=", `${to}T23:59:59.999Z`);
    const snap = await q.get();
    const orders = snap.docs.map((d) => d.data());

    const byDate = {};
    let paidByMethod = { upi: 0 };
    const customerKeys = new Set();
    for (const o of orders) {
      const date = (o.createdAt || "").split("T")[0];
      if (!date) continue;
      if (!byDate[date]) byDate[date] = { date, totalRevenue: 0, orderCount: 0, itemsSold: 0 };
      // Cancelled orders are counted so you can see them placed, but excluded
      // from revenue so the chart reflects real income.
      if (o.status !== "cancelled") byDate[date].totalRevenue += Number(o.total || 0);
      byDate[date].orderCount += 1;
      byDate[date].itemsSold += (o.items || []).reduce((s, i) => s + Number(i.quantity || 0), 0);

      // Revenue-by-payment-method: only orders actually marked "paid" count
      // toward either total, same spirit as excluding cancelled orders above.
      if (o.paymentStatus === "paid" && o.paymentMethod === "upi") {
        paidByMethod[o.paymentMethod] += Number(o.total || 0);
      }

      // Distinct customers within this date range — there's no customer
      // account id on an order, so the shipping phone/name is the best
      // available stand-in for "a distinct person who ordered".
      const key = o.shippingAddress?.phone || o.shippingAddress?.fullName;
      if (key) customerKeys.add(key);
    }

    const rows = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    return json(res, 200, { rows, paidByMethod, totalCustomers: customerKeys.size });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
