import { Link } from "react-router-dom";
import { Gift, Briefcase, Heart, PartyPopper } from "lucide-react";

const OCCASIONS = [
  { icon: Briefcase, label: "Corporate Gifts" },
  { icon: Heart, label: "Wedding Gifts" },
  { icon: PartyPopper, label: "Festive Hampers" },
  { icon: Gift, label: "Birthday Gifts" },
];

export default function Gifting() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="glass-panel rounded-glass p-10 text-center mb-10 bg-gradient-to-br from-caramel-400/10 to-berry-500/10">
        <h1 className="text-3xl font-bold text-cocoa-800 mb-3">Gift Nature's Goodness</h1>
        <p className="text-cocoa-600 max-w-xl mx-auto mb-6">
          Premium gift boxes for every occasion, thoughtfully packed with our finest organic desserts.
        </p>
        <Link to="/shop?category=gift-boxes" className="btn-primary">Explore Gift Collection</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {OCCASIONS.map(({ icon: Icon, label }) => (
          <div key={label} className="glass-panel rounded-glass p-6 text-center hover:shadow-lg transition-shadow">
            <Icon className="mx-auto mb-3 text-caramel-600" size={28} />
            <p className="text-sm font-medium text-cocoa-700">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
