import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <h1 className="text-4xl font-bold text-cocoa-800 mb-4">404</h1>
      <p className="text-cocoa-500 mb-6">Page not found.</p>
      <Link to="/" className="btn-primary">Back Home</Link>
    </div>
  );
}
