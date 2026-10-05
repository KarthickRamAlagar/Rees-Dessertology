import adminApi from "./adminApi";

export async function fetchSalesSummary({ from, to } = {}) {
  const { data } = await adminApi.get("/api/admin/sales", { params: { from, to } });
  return data;
}

export function getDateRange(preset) {
  const to = new Date(), from = new Date();
  switch (preset) {
    case "today": break;
    case "7d": from.setDate(to.getDate() - 7); break;
    case "15d": from.setDate(to.getDate() - 15); break;
    case "30d": from.setDate(to.getDate() - 30); break;
    case "3m": from.setMonth(to.getMonth() - 3); break;
    case "6m": from.setMonth(to.getMonth() - 6); break;
    case "9m": from.setMonth(to.getMonth() - 9); break;
    case "1y": from.setFullYear(to.getFullYear() - 1); break;
    default: from.setDate(to.getDate() - 30);
  }
  return { from: from.toISOString().split("T")[0], to: to.toISOString().split("T")[0] };
}
