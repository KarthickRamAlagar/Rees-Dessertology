import { Star } from "lucide-react";

export default function RatingStars({ rating = 0, size = 14, showCount, count }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? "fill-caramel-500 text-caramel-500" : "text-cream-300"}
        />
      ))}
      {showCount && (
        <span className="text-xs text-cocoa-500 ml-1">
          {rating} ({count})
        </span>
      )}
    </div>
  );
}
