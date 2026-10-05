import { Leaf, ChefHat, Heart, Users } from "lucide-react";
import UnsplashImage from "@/components/ui/UnsplashImage";
import HandwrittenNote from "@/components/ui/HandwrittenNote";
import LeafDecoration from "@/components/ui/LeafDecoration";
import JarLogo from "@/components/ui/JarLogo";

const FEATURES = [
  { icon: Leaf, label: "Freshly Made", sub: "Prepared with care for every order." },
  { icon: ChefHat, label: "Handcrafted", sub: "Every jar is layered and finished with attention to detail." },
  { icon: Heart, label: "Made With Love", sub: "Because that's how this journey started — and how we want it to continue." },
];

const SIGNATURE_LIST = ["Tea Tiramisu", "Coffee Cocoa Cream", "Fruity Creations", "Chocolate Flavours", "& More..."];

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-7 md:py-9">
      <section className="grid md:grid-cols-[0.92fr_1.08fr] gap-8 md:gap-10 items-center mb-6">
        <div className="md:pl-5">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-caramel-600 dark:text-caramel-300 mb-3">
            <Leaf size={16} /> Our Story
          </p>
          <h1 className="font-display text-4xl md:text-[3.2rem] font-bold text-cocoa-800 leading-[1.02]">
            A Little Jar.
          </h1>
          <h2 className="font-script text-5xl md:text-[4rem] font-normal text-caramel-500 dark:text-caramel-300 leading-none mb-5">
            A Lot of Love. ♡
          </h2>
          <div className="space-y-3.5 max-w-xl">
            <p className="text-xs md:text-[13px] text-cocoa-600 leading-5.5">
              Every great dessert begins with a craving. But Ree's Dessertology began with something a little more personal — a mother's love for making something special for the people around her.
            </p>
            <p className="text-xs md:text-[13px] text-cocoa-600 leading-5.5">
              What started in a home kitchen slowly became a dream: to create desserts that don't just satisfy a sweet tooth, but create a little moment of happiness with every spoonful. And that's how Ree's Dessertology was born.
            </p>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden h-72 md:h-[300px] border border-caramel-400/30 shadow-sm">
          <UnsplashImage query="dessert jar strawberry closeup wooden table" alt="A little jar, a lot of love" className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute top-6 right-6">
            <HandwrittenNote>Homemade<br />With Love ♡</HandwrittenNote>
          </div>
        </div>
      </section>

      <section className="relative grid sm:grid-cols-3 gap-3 mb-9">
        <LeafDecoration size={68} className="hidden lg:block absolute -left-3 top-1/2 -translate-y-1/2 text-caramel-500/15" />
        <LeafDecoration size={68} flip className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-caramel-500/15" />
        {FEATURES.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="rounded-2xl border border-caramel-400/20 bg-white/60 dark:bg-[#17110b]/60 px-5 py-4 flex items-center gap-4 shadow-sm">
            <span className="h-11 w-11 rounded-full border border-caramel-400/30 bg-caramel-400/10 flex items-center justify-center shrink-0">
              <Icon size={19} className="text-caramel-600 dark:text-caramel-300" />
            </span>
            <div>
              <p className="text-sm font-semibold text-cocoa-800 mb-0.5">{label}</p>
              <p className="text-[10px] text-cocoa-500 leading-4">{sub}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid md:grid-cols-[1.15fr_0.85fr] gap-8 items-center mb-9">
        <div className="md:pl-5">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-caramel-600 dark:text-caramel-300 mb-3">
            <Leaf size={16} /> Why “Ree”?
          </p>
          <p className="text-xs md:text-[13px] text-cocoa-600 leading-5.5 max-w-xl">
            Ree comes from Reena — the heart behind the brand. Every jar carries a little piece of her: her care, her creativity, and her belief that good food doesn't need to be complicated. It simply needs to be made with care and love.
          </p>
          <p className="font-script text-3xl text-caramel-500 dark:text-caramel-300 mt-4">Reena ♡</p>
          <p className="text-[10px] text-cocoa-400 -mt-1">The Heart Behind Ree's</p>
        </div>
        <div className="relative rounded-2xl overflow-hidden h-56 md:h-48 border border-caramel-400/20 rotate-[-2deg] shadow-md">
          <UnsplashImage query="woman decorating dessert jar kitchen" alt="Reena, the heart behind Ree's" className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          <div className="absolute bottom-3 right-4">
            <HandwrittenNote className="text-lg">Made<br />with Love ♡</HandwrittenNote>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-caramel-400/20 bg-caramel-400/5 dark:bg-[#17110b]/70 p-6 md:p-7 mb-5">
        <LeafDecoration size={75} className="absolute bottom-0 left-2 text-caramel-500/10" />
        <div className="relative grid md:grid-cols-[1fr_1px_0.62fr] gap-6 md:gap-7 items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <JarLogo size={28} className="text-caramel-600 dark:text-caramel-300" />
              <h2 className="font-display text-xl md:text-2xl font-bold text-cocoa-800">
                Our Signature?
              </h2>
            </div>
            <p className="font-script text-3xl text-caramel-500 dark:text-caramel-300 mb-2.5">Dessert Jars.</p>
            <p className="text-xs text-cocoa-600 leading-5 max-w-2xl">
              We don't make everything. We make dessert jars. And we make them our way. Each jar is carefully layered to create a different experience with every spoonful — creamy textures, soft cake or biscuit layers, and carefully chosen toppings coming together in one little jar.
            </p>
          </div>
          <div className="hidden md:block w-px h-24 bg-caramel-500/20" />
          <div>
            <p className="font-script text-lg text-caramel-600 dark:text-caramel-300 mb-2">From our kitchen, to your heart</p>
            <ul className="space-y-1.5">
              {SIGNATURE_LIST.map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-cocoa-600">
                  <Heart size={12} className="text-caramel-500 fill-caramel-500/20 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-caramel-400/15 bg-caramel-400/5 dark:bg-[#17110b]/60 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-caramel-500/15">
          {[
            { icon: Leaf, value: "100%", label: "Fresh Ingredients" },
            { icon: ChefHat, value: "Handcrafted", label: "With Love" },
            { icon: Users, value: "Moments", label: "of Happiness" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center justify-center gap-3 px-6 py-5">
              <span className="h-10 w-10 rounded-full bg-caramel-400/10 flex items-center justify-center shrink-0">
                <Icon size={17} className="text-caramel-600 dark:text-caramel-300" />
              </span>
              <div>
                <p className="text-sm font-bold text-caramel-600 dark:text-caramel-300">{value}</p>
                <p className="text-[10px] text-cocoa-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
