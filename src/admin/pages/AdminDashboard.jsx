import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchSalesSummary, getDateRange } from "@/admin/services/adminSales";
import { fetchProductsWithBanners } from "@/admin/services/adminProducts";
import StatCard from "@/admin/components/StatCard";

const LOW_STOCK_THRESHOLD = 5;

const RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "1 Week" },
  { value: "15d", label: "15 Days" },
  { value: "30d", label: "30 Days" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [range, setRange] = useState("30d");
  const { from, to } = useMemo(() => getDateRange(range), [range]);

  const { data: salesData, isLoading, isError } = useQuery({
    queryKey: ["sales-summary", from, to],
    queryFn: () => fetchSalesSummary({ from, to }),
  });
  const rows = salesData?.rows;
  const paidByMethod = salesData?.paidByMethod || { upi: 0 };
  const totalCustomers = salesData?.totalCustomers ?? 0;

  const totals = useMemo(() => {
    if (!rows) return { revenue: 0, orders: 0, items: 0 };
    return rows.reduce(
      (acc, r) => ({
        revenue: acc.revenue + (r.totalRevenue || 0),
        orders: acc.orders + (r.orderCount || 0),
        items: acc.items + (r.itemsSold || 0),
      }),
      { revenue: 0, orders: 0, items: 0 }
    );
  }, [rows]);

  const chartData = (rows || []).map((r) => ({
    date: new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    revenue: r.totalRevenue,
  }));

  const { data: products } = useQuery({
    queryKey: ["admin-products-for-stock"],
    queryFn: fetchProductsWithBanners,
  });
  const lowStock = (products || []).filter((p) => Number(p.stockQuantity ?? 0) <= LOW_STOCK_THRESHOLD);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-800">Sales Dashboard</h1>
        <p className="text-sm text-ink-400 mt-1">
          {isError
            ? "Could not load — check that admin credentials is set correctly"
            : "Revenue is computed live from your Firestore orders"}
        </p>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3 mb-2">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-amber-800">
              {lowStock.length} product{lowStock.length > 1 ? "s" : ""} at or below the low-stock threshold ({LOW_STOCK_THRESHOLD})
            </p>
          </div>
          <ul className="text-xs text-amber-700 space-y-1 ml-7">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <span>
                  <span className="font-medium">{p.name}</span> — {p.stockQuantity} left
                  {p.lowStockAlertAt && (
                    <span className="text-amber-600">
                      {" · threshold reached "}
                      {new Date(p.lowStockAlertAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
                      })}{" IST"}
                    </span>
                  )}
                </span>
                <button
                  onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                  className="text-amber-800 underline hover:no-underline shrink-0"
                >
                  Increase Stock
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card mb-6 inline-flex gap-1 p-1.5">
        {RANGE_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setRange(o.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              range === o.value ? "bg-accent-500 text-white" : "text-ink-600 hover:bg-ink-100"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Revenue" value={`₹${totals.revenue.toLocaleString("en-IN")}`} sublabel={RANGE_OPTIONS.find(o => o.value === range)?.label} />
        <StatCard label="Orders" value={totals.orders} />
        <StatCard label="Items Sold" value={totals.items} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard label="Paid via QR" value={`₹${(paidByMethod.upi || 0).toLocaleString("en-IN")}`} sublabel={RANGE_OPTIONS.find(o => o.value === range)?.label} />
        <StatCard label="Total Customers" value={totalCustomers} sublabel={RANGE_OPTIONS.find(o => o.value === range)?.label} />
      </div>

      <div className="card">
        <h2 className="font-semibold text-ink-700 mb-4">Revenue Trend</h2>
        {isLoading && <p className="text-sm text-ink-400 py-10 text-center">Loading chart…</p>}
        {!isLoading && chartData.length === 0 && (
          <p className="text-sm text-ink-400 py-10 text-center">
            No sales data yet for this range.
          </p>
        )}
        {!isLoading && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`₹${v}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="#c8912e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
