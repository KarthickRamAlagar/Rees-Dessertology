import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Leaf, Heart, CookieIcon, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import HandwrittenNote from "@/components/ui/HandwrittenNote";
import heroGiftHampers from "@/assets/heroGiftHampers.jpg";
import heroJarLineup from "@/assets/heroJarLineup.jpg";
import heroPomegranateJar from "@/assets/heroPomegranateJar.jpg";
import heroTeaCoffeeJars from "@/assets/heroTeaCoffeeJars.jpg";
import heroDragonfruitJar from "@/assets/heroDragonfruitJar.jpg";
import heroMangoJar from "@/assets/heroMangoJar.jpg";

// Local hero jar photos — previously these were Unsplash search queries
// resolved at runtime; now they're our own product shots bundled straight
// from src/assets/, so the slideshow below needs no network fetch.
const SLIDES = [
  heroGiftHampers,
  heroJarLineup,
  heroPomegranateJar,
  heroTeaCoffeeJars,
  heroDragonfruitJar,
  heroMangoJar,
];

const AUTOPLAY_MS = 4500;

const FEATURES = [
  { icon: Leaf, label: "Freshly Made", sub: "Prepared with care for every order." },
  { icon: Heart, label: "Made With Love", sub: "Because good food brings people together." },
  { icon: CookieIcon, label: "Signature Dessert Jars", sub: "One jar. Multiple layers. Unforgettable." },
];

export default function Hero() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % SLIDES.length);
  }, []);
  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [next, paused]);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 pt-5 md:pt-6">
      <div className="relative overflow-hidden rounded-[22px] border border-caramel-400/20 dark:border-caramel-400/30 bg-cream-100 dark:bg-[#1a120b] shadow-[0_10px_40px_rgba(107,66,38,0.08)]">
        <div className="relative min-h-[330px] md:min-h-[360px]">
          <AnimatePresence mode="sync">
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            >
              <img
                src={SLIDES[index]}
                alt="Ree's Dessertology jar"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-r from-cream-50 via-cream-50/92 via-40% to-transparent dark:from-[#0d0a07] dark:via-[#0d0a07]/88 dark:via-40% dark:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

          <div className="relative z-10 flex min-h-[330px] md:min-h-[360px] items-center px-6 md:px-12 py-10">
            <div className="max-w-[480px]">
              <span className="inline-flex items-center rounded-full border border-caramel-400/30 bg-white/60 dark:bg-black/25 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-caramel-700 dark:text-caramel-300 mb-4">
                Fresh • Eggless • Not too Sweet
              </span>
              <h1 className="font-display text-4xl md:text-[3.45rem] font-bold leading-[0.98] text-cocoa-800">
                Desserts Made to
                <span className="block font-script text-5xl md:text-[4.15rem] font-normal text-caramel-500 dark:text-caramel-300 mt-1">
                  Melt Hearts.
                </span>
              </h1>
              <p className="text-sm md:text-[13px] leading-6 text-cocoa-600 dark:text-cocoa-600 max-w-[380px] mt-4 mb-5">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <Link to="/shop" className="btn-primary inline-flex items-center gap-2 text-xs px-5 py-2.5 shadow-md shadow-caramel-500/15">
                  {t("hero.explore")} <ArrowRight size={14} />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-cocoa-500/20 bg-white/55 dark:bg-black/20 px-5 py-2.5 text-xs font-medium text-cocoa-700 hover:border-caramel-400 transition-colors"
                >
                  About Us
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute right-7 top-7 z-10 hidden md:block">
            <HandwrittenNote>Small Jar<br />Big Happiness ♡</HandwrittenNote>
          </div>

          <button
            type="button"
            aria-label="Previous slide"
            onClick={prev}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/70 dark:bg-black/35 border border-white/50 dark:border-white/10 flex items-center justify-center text-cocoa-700 backdrop-blur-sm hover:bg-white dark:hover:bg-black/50 transition-colors"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={next}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/70 dark:bg-black/35 border border-white/50 dark:border-white/10 flex items-center justify-center text-cocoa-700 backdrop-blur-sm hover:bg-white dark:hover:bg-black/50 transition-colors"
          >
            <ChevronRight size={17} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-caramel-500" : "w-1.5 bg-white/75"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-cocoa-500/10 bg-white/55 dark:bg-black/20 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-cocoa-500/10">
          {FEATURES.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 px-6 md:px-9 py-4.5">
              <span className="h-9 w-9 rounded-full bg-caramel-400/10 border border-caramel-400/20 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-caramel-600 dark:text-caramel-300" />
              </span>
              <div>
                <p className="text-xs md:text-sm font-semibold text-cocoa-800">{label}</p>
                <p className="text-[10px] md:text-xs text-cocoa-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
