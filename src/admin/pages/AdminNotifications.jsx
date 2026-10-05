import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Eye, EyeOff, Megaphone } from "lucide-react";
import {
  fetchAdminNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
} from "@/admin/services/adminNotifications";

export default function AdminNotifications() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", message: "" });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: fetchAdminNotifications,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });

  const createMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      setForm({ title: "", message: "" });
      invalidate();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => updateNotification(id, { active }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: invalidate,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    createMutation.mutate(form);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-800 mb-1">News &amp; Offers</h1>
      <p className="text-sm text-ink-400 mb-6">
        Written here, these show up as notifications for every logged-in customer.
      </p>

      <form onSubmit={handleSubmit} className="card space-y-3 mb-6">
        <div>
          <label className="text-sm font-medium text-ink-700 mb-1 block">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            placeholder="20% off this weekend"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-700 mb-1 block">Message</label>
          <textarea
            rows={2}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            placeholder="Use code SWEET20 at checkout. Valid till Sunday."
          />
        </div>
        <button type="submit" disabled={createMutation.isPending} className="btn-accent disabled:opacity-50">
          {createMutation.isPending ? "Posting…" : "Post Notification"}
        </button>
      </form>

      {isLoading && <p className="text-sm text-ink-400">Loading…</p>}
      {!isLoading && notifications?.length === 0 && (
        <p className="text-sm text-ink-400">No notifications posted yet.</p>
      )}

      <div className="space-y-3">
        {notifications?.map((n) => (
          <div key={n.id} className="card flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Megaphone size={18} className="text-accent-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-ink-800">{n.title}</p>
                <p className="text-sm text-ink-600">{n.message}</p>
                <p className="text-xs text-ink-400 mt-1">
                  {new Date(n._createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}{n.active ? "Active" : "Hidden"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleMutation.mutate({ id: n.id, active: !n.active })}
                title={n.active ? "Hide from customers" : "Show to customers"}
                className="btn-outline py-1.5 px-2.5"
              >
                {n.active ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => deleteMutation.mutate(n.id)}
                title="Delete"
                className="p-1.5 rounded-lg text-danger-500 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
