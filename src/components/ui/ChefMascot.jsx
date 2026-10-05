// Original chibi "little baker" mascot for the Contact page — a simple,
// brand-colored illustration of our own design (not a likeness of any
// existing character), stirring a mixing bowl with a few ingredient dots
// arranged around her.
export default function ChefMascot({ className = "" }) {
  return (
    <svg viewBox="0 0 320 320" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* ingredient dots, loosely arced above the shoulders */}
      <circle cx="56" cy="92" r="13" fill="#a3455a" />
      <path d="M56 80c3-5 8-6 11-4" stroke="#7c9473" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="252" cy="88" r="11" fill="#c8912e" />
      <circle cx="90" cy="60" r="8" fill="#7c9473" />
      <circle cx="226" cy="58" r="9" fill="#d9a441" />

      {/* mixing bowl */}
      <path d="M118 262c0 18 19 32 42 32s42-14 42-32Z" fill="#e9d8ba" stroke="#6b4226" strokeWidth="3" />
      <ellipse cx="160" cy="262" rx="42" ry="10" fill="#fdfbf7" stroke="#6b4226" strokeWidth="3" />

      {/* body / apron */}
      <path d="M126 196c0-22 15-36 34-36s34 14 34 36v44h-68Z" fill="#fdfbf7" stroke="#6b4226" strokeWidth="3" />
      <path d="M160 196c-5-6-14-2-14 5 0 6 7 10 14 15 7-5 14-9 14-15 0-7-9-11-14-5Z" fill="#a3455a" />

      {/* arms — left resting, right stirring into the bowl */}
      <path d="M126 210c-14 6-22 18-22 30" stroke="#6b4226" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="104" cy="240" r="8" fill="#f3e9d7" stroke="#6b4226" strokeWidth="2.5" />
      <path d="M194 206c16 4 28 18 30 34" stroke="#6b4226" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M222 238l3 20" stroke="#6b4226" strokeWidth="3" strokeLinecap="round" />

      {/* head */}
      <circle cx="160" cy="130" r="52" fill="#f3e9d7" stroke="#6b4226" strokeWidth="3" />

      {/* hair peeking from under the hat band */}
      <path d="M112 122c-2-8-1-16 3-22 9 6 23 9 45 9s36-3 45-9c4 6 5 14 3 22-12-10-28-7-48-7s-36-3-48 7Z" fill="#6b4226" />

      {/* chef toque: band + puffed top */}
      <rect x="114" y="100" width="92" height="18" rx="9" fill="#fff" stroke="#6b4226" strokeWidth="3" />
      <path d="M122 100c-6-28 14-48 38-48s44 20 38 48c-9-10-22-14-38-14s-29 4-38 14Z" fill="#fff" stroke="#6b4226" strokeWidth="3" />

      {/* face */}
      <circle cx="142" cy="134" r="4.5" fill="#402616" />
      <circle cx="178" cy="134" r="4.5" fill="#402616" />
      <circle cx="134" cy="146" r="7" fill="#d9a441" opacity="0.5" />
      <circle cx="186" cy="146" r="7" fill="#d9a441" opacity="0.5" />
      <path d="M146 152c5 6 23 6 28 0" stroke="#402616" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
