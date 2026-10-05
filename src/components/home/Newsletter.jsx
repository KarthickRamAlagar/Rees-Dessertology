import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import api from "@/services/api";
import { fetchNotifications } from "@/services/notifications";
import { useAuthStore } from "@/features/auth/authStore";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const user = useAuthStore((s) => s.user);

  // If a signed-in user's email is already on the subscriber list, skip the
  // form entirely and go straight to the "you're in" state — this check is
  // scoped to THIS card only; the footer's own newsletter form is separate
  // and always shows regardless of this result.
  const { data: subscriptionCheck } = useQuery({
    queryKey: ["newsletter-subscribed", user?.email],
    queryFn: async () => {
      const { data } = await api.get("/api/newsletter", { params: { email: user.email } });
      return data;
    },
    enabled: Boolean(user?.email),
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (email) => api.post("/api/newsletter", { email }),
  });

  const alreadySubscribed = Boolean(subscriptionCheck?.subscribed);
  const showThanks = mutation.isSuccess || alreadySubscribed;

  // Only fetched once they've actually subscribed (or already were) — shows
  // them the latest offer right away instead of just a bare "thanks" message.
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: showThanks,
  });
  const latest = notifications?.[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || mutation.isPending) return;
    mutation.mutate(email);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      {/* Always-white text here — this card is deliberately dark regardless
          of the site's light/dark theme, so it must not use the cream or
          cocoa color tokens (those flip meaning under html.dark and would
          make this text unreadable against its own background). */}
      <div className="glass-panel-dark rounded-glass p-8 md:p-10 text-center text-white">
        <h3 className="text-xl font-bold mb-2">Join Our Healthy Community</h3>
        <p className="text-white/70 mb-5 text-sm">Get exclusive offers, healthy living tips and more.</p>
        {showThanks ? (
          <div className="max-w-md mx-auto">
            <p className="text-caramel-300 font-medium mb-3">
              {alreadySubscribed && !mutation.isSuccess ? "You're already on the list! 🎉" : "Thanks for subscribing! 🎉"}
            </p>
            {latest && (
              <div className="glass-panel-dark rounded-xl p-4 flex items-start gap-2.5 text-left">
                <Megaphone size={18} className="text-caramel-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">{latest.title}</p>
                  <p className="text-xs text-white/70 mt-0.5">{latest.message}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 rounded-l-full px-4 py-2.5 text-sm bg-white placeholder:text-stone-400 outline-none"
              style={{ color: "#2b1a0f" }}
            />
            <button type="submit" disabled={mutation.isPending} className="btn-primary rounded-l-none disabled:opacity-50">
              {mutation.isPending ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}
        {mutation.isError && (
          <p className="text-red-300 text-xs mt-2">
            {mutation.error?.response?.data?.error || "Couldn't subscribe — try again."}
          </p>
        )}
      </div>
    </section>
  );
}
