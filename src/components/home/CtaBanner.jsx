import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import JarLogo from "@/components/ui/JarLogo";

// Fixed warm-espresso gradient (not a theme token) — stays the same bar in
// both themes, same as the footer and Our Promise band above it.
export default function CtaBanner() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-6">
      <div
        className="rounded-glass px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-5 text-white"
        style={{ background: "linear-gradient(135deg, #6b4226, #402616)" }}
      >
        <div className="flex items-center gap-4 text-center md:text-left">
          <span className="hidden sm:flex h-12 w-12 rounded-full bg-white/10 items-center justify-center shrink-0">
            <JarLogo size={24} className="text-caramel-300" />
          </span>
          <div>
            <p className="font-semibold text-lg">Dessert jars made to melt hearts.</p>
            <p className="text-white/60 text-sm">From Reena's kitchen to your sweetest moments.</p>
          </div>
        </div>
        <Link to="/shop" className="btn-primary inline-flex items-center gap-2 whitespace-nowrap">
          Explore Our Flavours <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
