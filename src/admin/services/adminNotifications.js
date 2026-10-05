import adminApi from "./adminApi";

export async function fetchAdminNotifications() {
  const { data } = await adminApi.get("/api/admin/notifications");
  return data.notifications;
}

export async function createNotification({ title, message, active = true }) {
  const { data } = await adminApi.post("/api/admin/notifications", { title, message, active });
  return data.notification;
}

export async function updateNotification(id, patch) {
  const { data } = await adminApi.put(`/api/admin/notifications/${encodeURIComponent(id)}`, patch);
  return data.notification;
}

export async function deleteNotification(id) {
  await adminApi.delete(`/api/admin/notifications/${encodeURIComponent(id)}`);
}
