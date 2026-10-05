import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TrackOrderLookup() {
  const [orderId, setOrderId] = useState("");
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <h1 className="text-2xl font-bold text-cocoa-800 mb-4">Track Your Order</h1>
      <form
        onSubmit={(e) => { e.preventDefault(); if (orderId) navigate(`/order/${orderId}/track`); }}
        className="glass-panel rounded-glass p-6"
      >
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter Order ID (e.g. NM123456)"
          className="w-full border border-cream-300 rounded-lg px-3 py-2 text-sm bg-white/70 mb-4"
        />
        <button type="submit" className="btn-primary w-full">Track Order</button>
      </form>
    </div>
  );
}
