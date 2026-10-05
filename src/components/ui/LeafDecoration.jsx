// A sprig of hand-drawn leaves — purely decorative line art used in the
// corners of the About/Home/Footer sections for a botanical, handmade feel.
// `flip` mirrors it so the same asset works on either side of a layout.
export default function LeafDecoration({ size = 90, className = "", flip = false }) {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 60 84"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M30 4C30 30 30 56 30 80" />
      <path d="M30 18c-8-6-16-4-20 2 8 4 14 2 20-2Z" />
      <path d="M30 34c8-6 16-4 20 2-8 4-14 2-20-2Z" />
      <path d="M30 50c-8-6-16-4-20 2 8 4 14 2 20-2Z" />
      <path d="M30 66c8-6 16-4 20 2-8 4-14 2-20-2Z" />
    </svg>
  );
}
