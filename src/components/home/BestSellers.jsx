import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/services/products";
import ProductCard from "@/components/product/ProductCard";
import Spinner from "@/components/ui/Spinner";
import SectionHeading from "@/components/ui/SectionHeading";

export default function BestSellers() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "bestsellers"],
    queryFn: () => fetchProducts({}),
  });

  const bestSellers = data?.data?.filter((p) => p.tags?.includes("Bestseller")) || [];

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <SectionHeading
        title="Best Selling Jars"
        subtitle="The flavors our customers keep coming back for."
        action={<Link to="/shop" className="text-sm text-caramel-600 font-medium hover:underline">View All</Link>}
      />

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(bestSellers.length ? bestSellers : data?.data?.slice(0, 4) || []).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
