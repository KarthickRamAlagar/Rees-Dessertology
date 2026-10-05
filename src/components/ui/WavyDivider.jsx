// A single gently-wavy rule — used above the footer's copyright row instead
// of a plain straight border, echoing the jar logo's handmade, organic line.
export default function WavyDivider({ className = "" }) {
  return (
    <svg
      viewBox="0 0 400 12"
      preserveAspectRatio="none"
      className={`w-full h-3 ${className}`}
      stroke="currentColor"
      strokeWidth="1.2"
      fill="none"
    >
      <path d="M0 6c16.7-6 33.3-6 50 0s33.3 6 50 0 33.3-6 50 0 33.3 6 50 0 33.3-6 50 0 33.3 6 50 0 33.3-6 50 0 33.3 6 50 0" />
    </svg>
  );
}
