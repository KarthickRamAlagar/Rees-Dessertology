import { useState } from "react";

export default function Tabs({ tabs }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex gap-6 border-b border-cream-200 mb-6 overflow-x-auto">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              active === i
                ? "border-caramel-500 text-cocoa-800"
                : "border-transparent text-cocoa-400 hover:text-cocoa-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active]?.content}</div>
    </div>
  );
}
