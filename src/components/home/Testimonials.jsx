import { Quote } from "lucide-react";
import { mockTestimonials } from "@/data/mockProducts";
import RatingStars from "@/components/ui/RatingStars";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <SectionHeading
        title="What Our Customers Say"
        subtitle="Real words from people who've opened a jar."
        align="center"
      />
      <div className="grid md:grid-cols-3 gap-6">
        {mockTestimonials.map((t) => (
          <div key={t.id} className="glass-panel rounded-glass p-6 relative">
            <Quote size={28} className="text-caramel-400/40 absolute top-5 right-5" />
            <RatingStars rating={t.rating} />
            <p className="text-cocoa-600 text-sm my-3 leading-relaxed relative z-10">{t.text}</p>
            <div className="flex items-center gap-2 mt-4">
              <span className="h-8 w-8 rounded-full bg-caramel-400/20 text-caramel-600 font-semibold text-sm flex items-center justify-center">
                {t.name.charAt(0)}
              </span>
              <div>
                <p className="text-cocoa-800 font-medium text-sm">{t.name}</p>
                {t.location && <p className="text-cocoa-400 text-xs">{t.location}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
