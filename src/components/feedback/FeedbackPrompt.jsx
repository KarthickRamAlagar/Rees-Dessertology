import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquareHeart } from "lucide-react";
import FeedbackForm from "./FeedbackForm";

// A simple banner + "Leave Feedback" button on the tracking page — the
// additive entry point Part 5.3 asks for, instead of restructuring
// TrackOrder.jsx's existing JSX. Shows only once an order is "awaiting
// feedback" (set when the admin confirms a QR payment — see
// api/admin/orders/[id].js — or as a safety net on delivery, see
// api/orders/[orderNumber]/deliver.js) and nothing has been submitted yet.
export default function FeedbackPrompt({ order }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  if (!order || order.feedbackStatus !== "awaiting") return null;

  return (
    <>
      <div className="glass-panel rounded-glass p-4 mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquareHeart size={18} className="text-caramel-500 shrink-0" />
          <p className="text-sm text-cocoa-700">We'd love to hear how this order went.</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary text-xs py-1.5 px-4 shrink-0">
          Leave Feedback
        </button>
      </div>

      {open && (
        <FeedbackForm
          order={order}
          onClose={() => setOpen(false)}
          onSubmitted={() => {
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ["order"] });
            queryClient.invalidateQueries({ queryKey: ["my-orders"] });
          }}
        />
      )}
    </>
  );
}
