import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, User } from "lucide-react";
import { fetchAdminMessages } from "@/admin/services/adminMessages";

export default function AdminUserMessages() {
  const { data: messages, isLoading, isError } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: fetchAdminMessages,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-800 mb-1">User Messages</h1>
      <p className="text-sm text-ink-400 mb-6">
        Submissions from the storefront's Contact page.
      </p>

      {isError && <p className="text-danger-500 text-sm mb-4">Could not load messages.</p>}
      {isLoading && <p className="text-sm text-ink-400">Loading…</p>}
      {!isLoading && messages?.length === 0 && (
        <p className="text-sm text-ink-400">No messages yet.</p>
      )}

      <div className="space-y-4">
        {messages?.map((m) => (
          <div key={m.id} className="glass-panel rounded-glass p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <User size={16} className="text-ink-400" />
                <p className="font-semibold text-ink-800">{m.name}</p>
              </div>
              <p className="text-xs text-ink-400 shrink-0">
                {new Date(m._createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-ink-400 mb-3">
              <span className="flex items-center gap-1.5"><Mail size={12} /> {m.email}</span>
              {m.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {m.phone}</span>}
            </div>
            <p className="text-sm text-ink-600 whitespace-pre-wrap">{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
