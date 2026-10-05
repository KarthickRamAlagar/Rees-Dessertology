export default function InfoPage({ title, children }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-cocoa-800 mb-6">{title}</h1>
      <div className="glass-panel rounded-glass p-6 text-sm text-cocoa-600 leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}
