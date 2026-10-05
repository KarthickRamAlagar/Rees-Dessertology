import api from "./api";

export async function fetchNotifications() {
  const { data } = await api.get("/api/notifications");
  return data.notifications || [];
}
