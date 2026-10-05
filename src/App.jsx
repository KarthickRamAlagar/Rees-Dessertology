import { Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import AdminProtectedRoute from "@/admin/routing/AdminProtectedRoute";
import AdminLayout from "@/admin/components/AdminLayout";
import AdminDashboard from "@/admin/pages/AdminDashboard";
import AdminOrders from "@/admin/pages/AdminOrders";
import AdminProducts from "@/admin/pages/AdminProducts";
import AdminProductCreate from "@/admin/pages/AdminProductCreate";
import AdminProductEdit from "@/admin/pages/AdminProductEdit";
import AdminUserMessages from "@/admin/pages/AdminUserMessages";
import AdminOrderChat from "@/admin/pages/AdminOrderChat";
import AdminChats from "@/admin/pages/AdminChats";
import AdminNotifications from "@/admin/pages/AdminNotifications";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import TrackOrder from "@/pages/TrackOrder";
import OrderChat from "@/pages/OrderChat";
import MyOrders from "@/pages/MyOrders";
import Wishlist from "@/pages/Wishlist";
import Account from "@/pages/Account";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Gifting from "@/pages/Gifting";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import TrackOrderLookup from "@/pages/TrackOrderLookup";
import InfoPage from "@/pages/InfoPage";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Orders are tied to the signed-in Google account, so these need sign-in. */}
        <Route path="/order/:orderId/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="/order/:orderId/track" element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
        <Route path="/order/:orderId/chat" element={<ProtectedRoute><OrderChat /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/gifting" element={<Gifting />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        {/* Order lookup needs sign-in: you can only open orders you own (admins: any). */}
        <Route path="/track-order" element={<ProtectedRoute><TrackOrderLookup /></ProtectedRoute>} />
        <Route
          path="/shipping-policy"
          element={
            <InfoPage title="Shipping Policy">
              <p>We ship across India via trusted courier partners. Standard delivery takes 4-6 business days; express delivery takes 1-2 business days.</p>
              <p>Orders above ₹999 qualify for free standard shipping.</p>
            </InfoPage>
          }
        />
        <Route
          path="/returns"
          element={
            <InfoPage title="Return & Refund Policy">
              <p>Since our products are perishable food items, we accept returns only for damaged or incorrect items received.</p>
              <p>Contact us within 48 hours of delivery with photos of the issue for a replacement or refund.</p>
            </InfoPage>
          }
        />
        <Route
          path="/faq"
          element={
            <InfoPage title="Frequently Asked Questions">
              <p><strong>Are your products really organic?</strong> Yes, all our ingredients are sourced from certified organic farms.</p>
              <p><strong>What's the shelf life?</strong> Most items stay fresh for 15-20 days when stored in an airtight container.</p>
              <p><strong>Do you ship pan-India?</strong> Yes, we deliver across India.</p>
            </InfoPage>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin section — same app, same URL as the storefront. Access: Google
          sign-in with an email listed in the server-side ADMIN_EMAILS (see
          AdminProtectedRoute.jsx; every /api/admin/* route re-checks it).
          Uses its own layout (sidebar, not the storefront navbar/footer). */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id/chat" element={<AdminOrderChat />} />
        <Route path="chats" element={<AdminChats />} />
        <Route path="chats/:id" element={<AdminChats />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductCreate />} />
        <Route path="products/:id/edit" element={<AdminProductEdit />} />
        <Route path="messages" element={<AdminUserMessages />} />
        <Route path="notifications" element={<AdminNotifications />} />
      </Route>
    </Routes>
  );
}
