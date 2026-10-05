export default function StatCard({ label, value, sublabel }) {
  return (
    <div className="card">
      <p className="text-sm text-ink-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-ink-800">{value}</p>
      {sublabel && <p className="text-xs text-ink-400 mt-1">{sublabel}</p>}
    </div>
  );
}
