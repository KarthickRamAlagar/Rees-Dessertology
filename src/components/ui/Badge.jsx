export default function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-cream-200 text-cocoa-700",
    organic: "bg-sage-500/15 text-sage-500",
    sale: "bg-berry-500/15 text-berry-500",
    caramel: "bg-caramel-400/15 text-caramel-600",
  };
  return (
    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${tones[tone] || tones.default}`}>
      {children}
    </span>
  );
}
