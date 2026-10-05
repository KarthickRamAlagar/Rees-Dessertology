import { db, json, cors, requireConfig } from "./_lib.js";

// Public — just two aggregate numbers for the landing page ("Happy
// Customers", "Total Revenue"). No order-level detail is exposed here.
export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    requireConfig();
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

    const snap = await db.collection("orders").get();
    const orders = snap.docs.map((d) => {
      const o = d.data();
      return { status: o.status, total: o.total, phone: o.shippingAddress?.phone };
    });

    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    // "Happy customers" = people whose order actually reached them.
    const happyCustomers = new Set(
      orders.filter((o) => o.status === "delivered" && o.phone).map((o) => o.phone)
    ).size;

    return json(res, 200, { totalRevenue, happyCustomers });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
