import { Heart } from "lucide-react";

// A short handwritten-style caption laid over a photo — the "Small Jar, Big
// Happiness" / "Homemade With Love" notes from the brand mockups. Always
// white text with a soft shadow since it only ever sits on a photo.
export default function HandwrittenNote({ children, className = "" }) {
  return (
    <p className={`font-script text-2xl md:text-3xl text-white leading-none drop-shadow-md flex items-start gap-1 ${className}`}>
      {children}
      <Heart size={16} className="fill-white mt-1.5 shrink-0" />
    </p>
  );
}
