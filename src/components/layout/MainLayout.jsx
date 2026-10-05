import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import NotificationToast from "./NotificationToast";
import Breadcrumbs from "./Breadcrumbs";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />
      <Breadcrumbs />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <NotificationToast />
    </div>
  );
}
