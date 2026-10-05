const OPTIONS = [
  { id: "standard", label: "Standard Delivery", eta: "4-6 Business Days", price: 0 },
  { id: "express", label: "Express Delivery", eta: "1-2 Business Days", price: 79 },
];

export default function DeliveryOptions({ selected, onSelect, onBack, onNext }) {
  return (
    <div className="glass-panel rounded-glass p-6 space-y-4">
      <h2 className="font-semibold text-cocoa-800 text-lg mb-2">Delivery Options</h2>
      {OPTIONS.map((opt) => (
        <label
          key={opt.id}
          className={`flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
            selected === opt.id ? "border-caramel-500 bg-caramel-400/5" : "border-cream-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              checked={selected === opt.id}
              onChange={() => onSelect(opt.id)}
            />
            <div>
              <p className="text-sm font-medium text-cocoa-700">{opt.label}</p>
              <p className="text-xs text-cocoa-500">{opt.eta}</p>
            </div>
          </div>
          <span className="text-sm font-medium text-cocoa-700">
            {opt.price === 0 ? "FREE" : `₹${opt.price}`}
          </span>
        </label>
      ))}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary flex-1">Back</button>
        <button onClick={onNext} className="btn-primary flex-1">Continue to Payment</button>
      </div>
    </div>
  );
}
