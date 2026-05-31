import React, { useState, useEffect, useMemo, startTransition } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
// Layout Components
import Header from "./components/layout/Header/Header";
import Footer from "./components/layout/Footer/Footer";

// Product Components
import ProductGrid from "./components/products/ProductGrid/ProductGrid";
import Cart from "./components/cart/Cart/Cart";

// Page Components
import Hero from "./pages/Home/Hero";
import FoodMenuPage from "./pages/Menu/FoodMenuPage";
import CategoryPage from "./pages/Menu/CategoryPage";
import ProductDetailPage from "./pages/Products/ProductDetailPage";
import ProductPage from "./pages/Products/ProductPage";
import Checkout from "./pages/Checkout/Checkout";
import AboutUs from "./pages/Info/AboutUs";
import Contact from "./pages/Info/Contact";
import DeliveryInfo from "./pages/Info/DeliveryInfo";
import PrivacyPolicy from "./pages/Info/PrivacyPolicy";
import TermsOfService from "./pages/Info/TermsOfService";
import NotFound from "./pages/NotFound/NotFound";

// Dashboard Pages
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

// Public Pages
import RequestFacilitatorAccess from "./pages/Public/RequestFacilitatorAccess";

// Data & Context
import { AuthProvider } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";
import { useDeliveryMenu } from "./hooks/useDeliveryMenu";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Use cart context instead of local state
  const { cartItems, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();

  // Live delivery menu from manager app's Supabase
  const { items: products, categories: liveCategories, loading: menuLoading, error: menuError } = useDeliveryMenu();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProductPageOpen, setIsProductPageOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Build display categories from live data
  const displayCategories = useMemo(() => liveCategories, [liveCategories]);

  // Scroll to top whenever location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Wrap addToCart to auto-open cart
  const handleAddToCart = (product) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  const handleCartToggle = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = () => {
    clearCart();
    setIsCheckoutOpen(false);
  };

  const handleCategoryChange = (category) => {
    startTransition(() => {
      if (category === "all") {
        navigate("/");
      } else {
        navigate(`/category/${category}`);
      }
    });
  };

  const handleProductClick = (product) => {
    // Helper function to create slug from product name
    const createSlug = (name) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim();
    };

    startTransition(() => {
      navigate(`/product/${createSlug(product.name)}`);
    });
  };

  // For backward compatibility with modal approach
  const handleProductPageClose = () => {
    setIsProductPageOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="App">
      <Header
        cartItems={cartItems}
        onCartToggle={handleCartToggle}
        onCategoryChange={handleCategoryChange}
        categories={displayCategories}
      />

      {isHomePage && <Hero />}

      <main role="main" id="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <ProductGrid
                products={products}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
                onCategoryChange={handleCategoryChange}
                categories={displayCategories}
              />
            }
          />
          <Route
            path="/menu"
            element={
              <FoodMenuPage
                categories={displayCategories}
                products={products}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
                loading={menuLoading}
                error={menuError}
              />
            }
          />
          <Route
            path="/category/:categoryId"
            element={
              <CategoryPage
                products={products}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
              />
            }
          />
          <Route
            path="/product/:productId"
            element={
              <ProductDetailPage products={products} onAddToCart={handleAddToCart} />
            }
          />
          <Route
            path="/about"
            element={<AboutUs />}
          />
          <Route
            path="/contact"
            element={<Contact />}
          />
          <Route
            path="/delivery"
            element={<DeliveryInfo />}
          />
          <Route
            path="/privacy-policy"
            element={<PrivacyPolicy />}
          />
          <Route
            path="/terms-of-service"
            element={<TermsOfService />}
          />
          <Route
            path="*"
            element={<NotFound />}
          />
          {/* Public Facilitator Access Request */}
          <Route path="/request-facilitator-access" element={<RequestFacilitatorAccess />} />

          {/* Dashboard Routes */}
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

      {/* Keep ProductPage for backward compatibility */}
      <ProductPage
        product={selectedProduct}
        isOpen={isProductPageOpen}
        onClose={handleProductPageClose}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

// Main App component with providers
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