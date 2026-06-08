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
import WorkshopList from "./pages/Dashboard/WorkshopList";
import WorkshopManager from "./pages/Dashboard/WorkshopManager";
import EventList from "./pages/Dashboard/EventList";
import EventManager from "./pages/Dashboard/EventManager";
import RetreatList from "./pages/Dashboard/RetreatList";
import RetreatManager from "./pages/Dashboard/RetreatManager";
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

  const { cartItems, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { items: products, loading: menuLoading, error: menuError } = useDeliveryMenu();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const handleAddToCart = (product) => { addToCart(product); setIsCartOpen(true); };
  const handleCartToggle = () => setIsCartOpen(o => !o);
  const handleCheckout = () => { setIsCartOpen(false); setIsCheckoutOpen(true); };
  const handleOrderComplete = () => { clearCart(); setIsCheckoutOpen(false); };
  const handleProductClick = (product) => startTransition(() => navigate(`/product/${toSlug(product.name)}`));

  return (
    <div className="App">
      <Header cartItems={cartItems} onCartToggle={handleCartToggle} />

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
            <Route path="workshops" element={<WorkshopList />} />
            <Route path="create-workshop" element={<WorkshopManager />} />
            <Route path="edit-workshop/:id" element={<WorkshopManager />} />
            <Route path="events" element={<EventList />} />
            <Route path="create-event" element={<EventManager />} />
            <Route path="edit-event/:id" element={<EventManager />} />
            <Route path="retreats" element={<RetreatList />} />
            <Route path="create-retreat" element={<RetreatManager />} />
            <Route path="edit-retreat/:id" element={<RetreatManager />} />
            <Route path="facilitator-requests" element={<FacilitatorRequests />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
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
