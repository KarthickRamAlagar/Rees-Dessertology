import { useQuery } from "@tanstack/react-query";
import { Users, Wallet } from "lucide-react";
import { fetchStats } from "@/services/stats";

// Replaces the old "Nature's Goodness in Every Bite" promo block — real
// numbers from Firestore orders instead of a generic tagline.
export default function PromoBanner() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["public-stats"],
    queryFn: fetchStats,
  });

  const cards = [
    { icon: Users, label: "Happy Customers", value: stats?.happyCustomers ?? 0 },
    { icon: Wallet, label: "Total Revenue", value: `₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}` },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-6">
      <div className="grid sm:grid-cols-2 gap-6">
        {cards.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="glass-panel rounded-glass p-8 flex items-center gap-5 bg-gradient-to-r from-caramel-400/10 to-sage-500/10"
          >
            <div className="h-14 w-14 rounded-full bg-caramel-400/15 flex items-center justify-center shrink-0">
              <Icon size={26} className="text-caramel-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-cocoa-800">
                {isLoading ? "…" : value}
              </p>
              <p className="text-sm text-cocoa-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
