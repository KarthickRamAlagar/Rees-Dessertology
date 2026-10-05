const METHODS = [
  { id: "upi", label: "QR Code (UPI — GPay, PhonePe, Paytm)" },
];

export default function PaymentMethod({ selected, onSelect, onBack, onPay, isPlacing, amount = 0 }) {
  // Public QR-generation endpoint — no API key needed. Encodes a standard UPI deep link
  // so any UPI app (GPay/PhonePe/Paytm) can scan and pre-fill the payee + amount.
  const upiString = `upi://pay?pa=reesdessertology@upi&pn=Rees%20Dessertology&am=${amount}&cu=INR`;
  const generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
  // Your own QR image: save it as client/public/payment-qr.png. If that file
  // isn't there, fall back to the generated QR above.
  const qrUrl = "/payment-qr.png";

  return (
    <div className="glass-panel rounded-glass p-6 space-y-3">
      <h2 className="font-semibold text-cocoa-800 text-lg mb-2">Payment Method</h2>
      {METHODS.map((m) => (
        <div key={m.id}>
          <label
            className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
              selected === m.id ? "border-caramel-500 bg-caramel-400/5" : "border-cream-300"
            }`}
          >
            <input type="radio" checked={selected === m.id} onChange={() => onSelect(m.id)} />
            <span className="text-sm text-cocoa-700">{m.label}</span>
          </label>

          {m.id === "upi" && selected === "upi" && (
            <div className="mt-3 mb-1 flex flex-col items-center border border-dashed border-caramel-400 rounded-lg py-5 bg-caramel-400/5">
              <img
                src={qrUrl}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = generatedQrUrl; }}
                alt="Scan to pay via UPI"
                className="rounded-md bg-white p-2"
                width={160}
                height={160}
              />
              <p className="text-sm text-cocoa-700 font-medium mt-3">Scan &amp; Pay ₹{amount}</p>
              <p className="text-xs text-cocoa-500">Open GPay, PhonePe or Paytm and scan this code</p>
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary flex-1">Back</button>
        <button onClick={onPay} disabled={isPlacing} className="btn-primary flex-1 disabled:opacity-50">
          {isPlacing ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
