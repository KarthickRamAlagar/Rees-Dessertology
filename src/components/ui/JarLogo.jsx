// Line-art dessert-jar mark used as the brand icon — a lidded jar with a
// little heart on its belly, drawn with currentColor so it follows whatever
// text color wraps it (caramel on the navbar, gold-on-dark in the footer).
export default function JarLogo({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5h8" />
      <path d="M13 5v3.2c0 .5-.2 1-.6 1.3L10 11.8" />
      <path d="M19 5v3.2c0 .5.2 1 .6 1.3l2.4 2.3" />
      <rect x="8.5" y="11.5" width="15" height="15.5" rx="4" />
      <path d="M8.5 17.5h15" />
      <path d="M16 20.3c-1-1.3-3.2-.7-3.2.9 0 1.2 1.4 2 3.2 3.4 1.8-1.4 3.2-2.2 3.2-3.4 0-1.6-2.2-2.2-3.2-.9Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
