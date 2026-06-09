import React, { useState, useEffect, startTransition } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Layout
import Header from "./components/layout/Header/Header";
import Footer from "./components/layout/Footer/Footer";

// Product / Cart
import ProductGrid from "./components/products/ProductGrid/ProductGrid";
import Cart from "./components/cart/Cart/Cart";

// Pages
import FoodMenuPage from "./pages/Menu/FoodMenuPage";
import CategoryPage from "./pages/Menu/CategoryPage";
import ProductDetailPage from "./pages/Products/ProductDetailPage";
import Checkout from "./pages/Checkout/Checkout";
import AboutUs from "./pages/Info/AboutUs";
import VisitPage from "./pages/Info/VisitPage";
import Contact from "./pages/Info/Contact";
import DeliveryInfo from "./pages/Info/DeliveryInfo";
import PrivacyPolicy from "./pages/Info/PrivacyPolicy";
import TermsOfService from "./pages/Info/TermsOfService";
import NotFound from "./pages/NotFound/NotFound";

// Dashboard
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import DashboardHome from "./pages/Dashboard/DashboardHome";
import Login from "./pages/Dashboard/Login";
import Register from "./pages/Dashboard/Register";
import OfferingList from "./pages/Dashboard/OfferingList";
import OfferingManager from "./pages/Dashboard/OfferingManager";
import RSVPList from "./pages/Dashboard/RSVPList";
import FacilitatorRequests from "./pages/Dashboard/FacilitatorRequests";
import RequestFacilitatorAccess from "./pages/Public/RequestFacilitatorAccess";

// Context / data
import { AuthProvider } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";
import { useDeliveryMenu } from "./hooks/useDeliveryMenu";

const toSlug = (name = "") =>
  name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const { cartItems, addToCart, updateQuantity, removeFromCart, clearCart, bagOpen, setBagOpen } = useCart();
  const { items: products, loading: menuLoading, error: menuError } = useDeliveryMenu();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const handleAddToCart = (product) => { addToCart(product); setBagOpen(true); };
  const handleCheckout = () => { setBagOpen(false); setIsCheckoutOpen(true); };
  const handleOrderComplete = () => { clearCart(); setIsCheckoutOpen(false); };
  const handleProductClick = (product) => startTransition(() => navigate(`/product/${toSlug(product.name)}`));

  return (
    <div className="App">
      <Header />

      <main role="main" id="main-content">
        <Routes>
          <Route path="/" element={
            <ProductGrid products={products} onAddToCart={handleAddToCart} onProductClick={handleProductClick} />
          } />
          <Route path="/menu" element={
            <FoodMenuPage products={products} onAddToCart={handleAddToCart} onProductClick={handleProductClick} loading={menuLoading} error={menuError} />
          } />
          <Route path="/category/:categoryId" element={
            <CategoryPage products={products} onAddToCart={handleAddToCart} onProductClick={handleProductClick} loading={menuLoading} error={menuError} />
          } />
          <Route path="/product/:productId" element={
            <ProductDetailPage products={products} onAddToCart={handleAddToCart} />
          } />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/visit" element={<VisitPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/delivery" element={<DeliveryInfo />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/request-facilitator-access" element={<RequestFacilitatorAccess />} />
          <Route path="/facilitator-login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="rsvps" element={<RSVPList />} />
            <Route path="workshops" element={<OfferingList type="workshop" />} />
            <Route path="create-workshop" element={<OfferingManager type="workshop" />} />
            <Route path="edit-workshop/:id" element={<OfferingManager type="workshop" />} />
            <Route path="events" element={<OfferingList type="event" />} />
            <Route path="create-event" element={<OfferingManager type="event" />} />
            <Route path="edit-event/:id" element={<OfferingManager type="event" />} />
            <Route path="retreats" element={<OfferingList type="retreat" />} />
            <Route path="create-retreat" element={<OfferingManager type="retreat" />} />
            <Route path="edit-retreat/:id" element={<OfferingManager type="retreat" />} />
            <Route path="facilitator-requests" element={<FacilitatorRequests />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

      <Cart
        isOpen={bagOpen}
        onClose={() => setBagOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
