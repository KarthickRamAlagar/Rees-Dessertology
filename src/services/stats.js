import api from "./api";

export async function fetchStats() {
  const { data } = await api.get("/api/stats");
  return data;
}
