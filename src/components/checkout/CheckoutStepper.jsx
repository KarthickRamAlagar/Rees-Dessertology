export default function CheckoutStepper({ step }) {
  const steps = ["Address", "Delivery", "Payment"];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i <= step ? "bg-caramel-500 text-white" : "bg-cream-200 text-cocoa-400"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-xs mt-1 ${i <= step ? "text-cocoa-800 font-medium" : "text-cocoa-400"}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-10 md:w-20 h-0.5 ${i < step ? "bg-caramel-500" : "bg-cream-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
