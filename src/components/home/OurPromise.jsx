import { Leaf, ChefHat, Heart } from "lucide-react";
import LeafDecoration from "@/components/ui/LeafDecoration";

const PROMISES = [
  { icon: Leaf, label: "Freshly Made", sub: "Prepared with care for every order." },
  { icon: ChefHat, label: "Handcrafted", sub: "Every jar is layered and finished with attention to detail." },
  { icon: Heart, label: "Made With Love", sub: "Because that's how this journey started — and how we want it to continue." },
];

export default function OurPromise() {
  return (
    <section className="relative overflow-hidden max-w-7xl mx-auto px-4 md:px-6 pb-8">
      <div className="relative overflow-hidden rounded-2xl border border-caramel-400/15 bg-caramel-400/5 dark:bg-[#17110b]/70 px-5 md:px-10 py-7">
        <LeafDecoration size={70} className="hidden md:block absolute -top-1 left-3 text-caramel-500/15" />
        <LeafDecoration size={70} flip className="hidden md:block absolute -bottom-2 right-3 text-caramel-500/15" />
        <h2 className="relative font-script text-3xl text-caramel-600 dark:text-caramel-300 text-center mb-6">
          Our Promise
        </h2>
        <div className="relative grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-caramel-500/15">
          {PROMISES.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center text-center px-5 py-2">
              <span className="h-10 w-10 rounded-full bg-caramel-400/10 flex items-center justify-center mb-2">
                <Icon size={18} className="text-caramel-600 dark:text-caramel-300" />
              </span>
              <p className="text-xs font-semibold text-cocoa-800 mb-1">{label}</p>
              <p className="text-[10px] leading-4 text-cocoa-500 max-w-[210px]">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
