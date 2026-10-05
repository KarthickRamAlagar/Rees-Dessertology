import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

// Admin section layout — deliberately does NOT use the storefront's
// Navbar/Footer (MainLayout). It has its own sidebar nav instead, same as
// the old standalone admin app did. Scoped with .admin-root so the admin
// color tokens (ink-*, accent-*) don't leak onto the public site.
// Access is gated by AdminProtectedRoute (Google sign-in + ADMIN_EMAILS).
export default function AdminLayout() {
  return (
    <div className="admin-root flex flex-col md:flex-row min-h-screen bg-ink-50 text-ink-800">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-x-hidden">
        <Breadcrumbs variant="admin" />
        <Outlet />
      </main>
    </div>
  );
}
