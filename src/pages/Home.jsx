import Hero from "@/components/home/Hero";
import PopularCategories from "@/components/home/PopularCategories";
import OurStory from "@/components/home/OurStory";
import OurPromise from "@/components/home/OurPromise";

export default function Home() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <PopularCategories />
      <OurStory />
      <OurPromise />
    </div>
  );
}
