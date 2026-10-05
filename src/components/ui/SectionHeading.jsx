// Shared section header used across the storefront — a jar-shaped accent
// mark next to the heading instead of a generic eyebrow label, so every
// section on the site reads as part of the same design language.
export default function SectionHeading({ title, subtitle, action, align = "left" }) {
  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-4 mb-7 ${
        align === "center" ? "text-center flex-col items-center" : ""
      }`}
    >
      <div>
        <div className={`flex items-center gap-2.5 ${align === "center" ? "justify-center" : ""}`}>
          <span className="w-2 h-5 rounded-full bg-caramel-500 inline-block" />
          <h2 className="text-2xl md:text-[28px] font-bold text-cocoa-800">{title}</h2>
        </div>
        {subtitle && <p className="text-sm text-cocoa-500 mt-1.5 max-w-md">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
