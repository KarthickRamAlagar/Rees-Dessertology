import { Link } from "react-router-dom";

export default function EmptyState({ title, subtitle, ctaLabel, ctaTo }) {
  return (
    <div className="text-center py-16 px-6">
      <h2 className="text-xl font-semibold text-cocoa-700 mb-2">{title}</h2>
      {subtitle && <p className="text-cocoa-500 mb-6">{subtitle}</p>}
      {ctaLabel && ctaTo && (
        <Link to={ctaTo} className="btn-primary">{ctaLabel}</Link>
      )}
    </div>
  );
}
