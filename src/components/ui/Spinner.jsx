export default function Spinner({ className = "" }) {
  return (
    <div className={`flex items-center justify-center py-10 ${className}`}>
      <div className="h-8 w-8 border-3 border-caramel-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
