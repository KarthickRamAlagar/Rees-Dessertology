import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import JarLogo from "@/components/ui/JarLogo";
import WavyDivider from "@/components/ui/WavyDivider";
import UnsplashImage from "@/components/ui/UnsplashImage";

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.55 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}
function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function PinterestIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.37 2 11.75c0 4.12 2.6 7.64 6.26 9.06-.09-.77-.16-1.95.03-2.79.18-.76 1.17-4.84 1.17-4.84s-.3-.6-.3-1.48c0-1.39.82-2.43 1.83-2.43 0.87 0 1.29.64 1.29 1.4 0 .85-.55 2.13-.84 3.32-.24 1 .5 1.81 1.49 1.81 1.79 0 3-2.25 3-4.92 0-2.03-1.39-3.54-3.91-3.54-2.85 0-4.62 2.09-4.62 4.42 0 .8.24 1.37.62 1.81.17.2.2.28.13.51-.05.17-.16.61-.2.78-.07.25-.26.34-.48.25-1.35-.54-1.98-1.98-1.98-3.6 0-2.68 2.31-5.89 6.88-5.89 3.68 0 6.1 2.62 6.1 5.43 0 3.72-2.07 6.5-5.11 6.5-1.02 0-1.99-.55-2.32-1.18l-.65 2.5c-.21.78-.63 1.57-1.02 2.18.9.27 1.86.42 2.86.42 5.52 0 10-4.37 10-9.75S17.52 2 12 2Z" />
    </svg>
  );
}
function YoutubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.5 7.1a2.8 2.8 0 0 0-1.97-2C18.9 4.6 12 4.6 12 4.6s-6.9 0-8.53.5A2.8 2.8 0 0 0 1.5 7.1 29.6 29.6 0 0 0 1 12.5a29.6 29.6 0 0 0 .5 5.4 29.6 29.6 0 0 0 .5 5.4 2.8 2.8 0 0 0 1.97 2c1.63.5 8.53.5 8.53.5s6.9 0 8.53-.5a2.8 2.8 0 0 0 1.97-2 29.6 29.6 0 0 0 .5-5.4 29.6 29.6 0 0 0 .5-5.4 29.6 29.6 0 0 0-.5-5.4ZM9.9 15.9V9.1l6 3.4-6 3.4Z" />
    </svg>
  );
}
function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56Z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
  { label: "Pinterest", href: "https://pinterest.com", Icon: PinterestIcon },
  { label: "YouTube", href: "https://youtube.com", Icon: YoutubeIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/karthi21903/", Icon: LinkedInIcon },
];

const LINKEDIN_URL = "https://www.linkedin.com/in/karthi21903/";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative mt-10 overflow-hidden text-white" style={{ backgroundColor: "#1b1009" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 bottom-0 w-48 md:w-64 opacity-45">
          <UnsplashImage query="strawberry dessert jar dark moody" alt="" className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1b1009]/50 to-[#1b1009]" />
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-48 md:w-64 opacity-40">
          <UnsplashImage query="chocolate dessert jar dark moody" alt="" className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#1b1009]/50 to-[#1b1009]" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr_1.1fr] gap-8 md:gap-10">
          <div className="md:pr-6">
            <div className="flex flex-col items-start mb-3">
              <span className="h-11 w-11 rounded-full border border-caramel-400/40 bg-caramel-400/5 flex items-center justify-center text-caramel-300 mb-2">
                <JarLogo size={25} />
              </span>
              <span className="font-script text-4xl leading-none text-caramel-300">Ree's</span>
              <span className="font-display text-xl tracking-wide text-white">Dessertology</span>
            </div>
            <p className="text-sm text-white/65 italic">Dessert jars made to melt hearts.</p>
            <div className="flex items-center gap-3 mt-5 text-caramel-400/70">
              <span className="h-px w-16 bg-caramel-400/40" />
              <span>♡</span>
              <span className="h-px w-16 bg-caramel-400/40" />
            </div>
          </div>

          <div className="border-l border-white/10 pl-6">
            <h4 className="flex items-center gap-2 font-display font-bold mb-4 text-sm tracking-wide text-caramel-300">
              <span className="text-caramel-400">⌁</span> Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-white/75">
              <li><Link to="/" className="hover:text-white transition-colors">{t("nav.home")}</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">{t("nav.shop")}</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">{t("nav.about")}</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">{t("nav.contact")}</Link></li>
            </ul>
          </div>

          <div className="border-l border-white/10 pl-6">
            <h4 className="flex items-center gap-2 font-display font-bold mb-4 text-sm tracking-wide text-caramel-300">
              <span className="text-caramel-400">⌁</span> Customer Service
            </h4>
            <ul className="space-y-2.5 text-xs text-white/75">
              <li><Link to="/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">Returns & Refund</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div className="border-l border-white/10 pl-6">
            <h4 className="flex items-center gap-2 font-display font-bold mb-4 text-sm tracking-wide text-caramel-300">
              <span className="text-caramel-400">⌁</span> Follow Us
            </h4>
            <div className="flex gap-2 mb-5">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full border border-caramel-400/60 flex items-center justify-center text-caramel-300 hover:bg-caramel-500 hover:text-white transition-colors"
                >
                  <Icon width={13} height={13} />
                </a>
              ))}
            </div>
            <p className="font-script text-2xl leading-tight text-caramel-300/90">Sweet moments<br />together ♡</p>
          </div>
        </div>

        <div className="flex items-center gap-3 my-8 text-caramel-500/50">
          <WavyDivider />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-5 text-center text-[10px] text-white/55">
          <p>© {new Date().getFullYear()} Ree's Dessertology. All rights reserved.</p>
          <span className="hidden md:block text-caramel-500/50">|</span>
          <p className="flex items-center gap-1.5">
            Developed by
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-caramel-300 hover:text-white font-medium transition-colors inline-flex items-center gap-1"
            >
              <LinkedInIcon width={12} height={12} />
              Karthickramalagar
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
