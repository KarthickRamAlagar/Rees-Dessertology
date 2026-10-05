import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({ value, onChange, min = 1, max = 20 }) {
  return (
    <div className="flex items-center border border-cream-300 rounded-full overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="p-2 text-cocoa-600 hover:bg-cream-100"
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>
      <span className="px-3 text-sm font-medium text-cocoa-800 w-8 text-center">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="p-2 text-cocoa-600 hover:bg-cream-100"
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
