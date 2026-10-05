import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Star, X } from "lucide-react";
import { submitFeedback } from "@/services/feedback";

function StarInput({ value, onChange, label }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-cocoa-700">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => onChange(i)} aria-label={`${i} star`}>
            <Star size={20} className={i <= value ? "fill-caramel-500 text-caramel-500" : "text-cream-300"} />
          </button>
        ))}
      </div>
    </div>
  );
}

// Order-summary + ratings modal, reused both from the Checkout block (Part
// 5.4) and from a tracking-page prompt (FeedbackPrompt.jsx). `order` only
// needs id/items/total — the same shape services/orders.js already
// normalizes orders into, so no separate fetch/shape is needed here.
export default function FeedbackForm({ order, onClose, onSubmitted }) {
  const [packing, setPacking] = useState(0);
  const [safeDelivery, setSafeDelivery] = useState(0);
  const [taste, setTaste] = useState(0);
  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: () => submitFeedback(order.id, { packing, safeDelivery, taste, comment }),
    onSuccess: () => onSubmitted?.(),
  });

  const canSubmit = packing > 0 && safeDelivery > 0 && taste > 0;

  return (
    <div className="fixed inset-0 z-[100] bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-glass shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-cocoa-800 text-lg">How was Order #{order.id}?</h2>
          <button onClick={onClose} className="text-cocoa-400 hover:text-cocoa-700"><X size={18} /></button>
        </div>

        <div className="glass-panel rounded-glass p-3 mb-4">
          <p className="text-xs text-cocoa-500 mb-2">
            {order.items?.map((i) => i.name).join(", ")}
          </p>
          <p className="text-sm font-semibold text-cocoa-800">₹{order.total}</p>
        </div>

        <div className="space-y-3 mb-4">
          <StarInput label="Packing" value={packing} onChange={setPacking} />
          <StarInput label="Safe Delivery" value={safeDelivery} onChange={setSafeDelivery} />
          <StarInput label="Taste" value={taste} onChange={setTaste} />
        </div>

        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Anything else you'd like to share? (optional)"
          className="w-full border border-cream-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-caramel-400"
        />

        {mutation.isError && (
          <p className="text-danger-500 text-xs mb-3">
            {mutation.error?.response?.data?.error || "Couldn't submit feedback — please try again."}
          </p>
        )}

        <button
          onClick={() => mutation.mutate()}
          disabled={!canSubmit || mutation.isPending}
          className="btn-primary w-full disabled:opacity-50"
        >
          {mutation.isPending ? "Submitting…" : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
}
