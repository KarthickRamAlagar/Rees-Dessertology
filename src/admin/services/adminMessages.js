import adminApi from "./adminApi";

export async function fetchAdminMessages() {
  const { data } = await adminApi.get("/api/admin/messages");
  return data.messages;
}
