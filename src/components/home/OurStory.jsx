import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import UnsplashImage from "@/components/ui/UnsplashImage";
import HandwrittenNote from "@/components/ui/HandwrittenNote";

export default function OurStory() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 pb-8">
      <div className="grid md:grid-cols-[0.92fr_1.28fr] gap-0 overflow-hidden rounded-2xl border border-caramel-400/20 bg-white/55 dark:bg-[#17110b]/60 shadow-sm">
        <div className="relative h-64 md:h-72">
          <UnsplashImage query="dessert jar on wooden table love" alt="A little jar, a lot of love" className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <div className="absolute bottom-5 right-5">
            <HandwrittenNote>A little jar<br />A lot of love ♡</HandwrittenNote>
          </div>
        </div>
        <div className="p-7 md:p-9 flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-caramel-600 dark:text-caramel-300 mb-2">
            Our Story
          </p>
          <h2 className="font-display text-xl md:text-[23px] font-bold text-cocoa-800 mb-2.5">
            A Little Jar. A Lot of Love. <span className="text-caramel-500">♡</span>
          </h2>
          <p className="text-xs md:text-[13px] text-cocoa-600 leading-5.5 mb-4 max-w-2xl">
            Every great dessert begins with a craving. But Ree's Dessertology began with something a little more personal — a mother's love for making something special for the people around her. What started in a home kitchen slowly became a dream: to create a little moment of happiness with every spoonful.
          </p>
          <Link to="/about" className="btn-primary inline-flex items-center gap-2 w-fit text-xs px-5 py-2.5">
            Read More <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
