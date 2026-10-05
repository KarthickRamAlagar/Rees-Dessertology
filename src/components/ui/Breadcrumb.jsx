import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-cocoa-500 mb-4 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {item.to ? (
            <Link to={item.to} className="hover:text-caramel-600">{item.label}</Link>
          ) : (
            <span className="text-cocoa-700 font-medium">{item.label}</span>
          )}
          {i < items.length - 1 && <ChevronRight size={14} />}
        </span>
      ))}
    </nav>
  );
}
