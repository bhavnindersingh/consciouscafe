import React, { useState, useEffect, startTransition, lazy, Suspense } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Layout — always needed, kept in the main bundle
import Header from "./components/layout/Header/Header";
import Footer from "./components/layout/Footer/Footer";
import ErrorBoundary from "./components/common/ErrorBoundary/ErrorBoundary";

// Product / Cart — homepage + cart are the common first paint, kept eager
import ProductGrid from "./components/products/ProductGrid/ProductGrid";
import Cart from "./components/cart/Cart/Cart";
// Checkout is an always-mounted animated drawer, so it stays eager (its
// enter/exit transition depends on staying in the tree).
import Checkout from "./pages/Checkout/Checkout";
import LANDING_PAGES from "./data/landingPages.json";

// Everything below is route-level code split so it isn't shipped on first load.
const FoodMenuPage = lazy(() => import("./pages/Menu/FoodMenuPage"));
const CategoryPage = lazy(() => import("./pages/Menu/CategoryPage"));
const ProductDetailPage = lazy(() => import("./pages/Products/ProductDetailPage"));
const AboutUs = lazy(() => import("./pages/Info/AboutUs"));
const VisitPage = lazy(() => import("./pages/Info/VisitPage"));
const Contact = lazy(() => import("./pages/Info/Contact"));
const DeliveryInfo = lazy(() => import("./pages/Info/DeliveryInfo"));
const PrivacyPolicy = lazy(() => import("./pages/Info/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/Info/TermsOfService"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const PrintMenuPage = lazy(() => import("./pages/Print/PrintMenuPage"));
const LandingPage = lazy(() => import("./pages/Landing/LandingPage"));

// Dashboard — heavy, auth-gated, never part of a public first paint
const DashboardLayout = lazy(() => import("./pages/Dashboard/DashboardLayout"));
const DashboardHome = lazy(() => import("./pages/Dashboard/DashboardHome"));
const Login = lazy(() => import("./pages/Dashboard/Login"));
const Register = lazy(() => import("./pages/Dashboard/Register"));
const OfferingList = lazy(() => import("./pages/Dashboard/OfferingList"));
const OfferingManager = lazy(() => import("./pages/Dashboard/OfferingManager"));
const RSVPList = lazy(() => import("./pages/Dashboard/RSVPList"));
const FacilitatorRequests = lazy(() => import("./pages/Dashboard/FacilitatorRequests"));
const RequestFacilitatorAccess = lazy(() => import("./pages/Public/RequestFacilitatorAccess"));

// Minimal, layout-stable fallback (avoids CLS while a chunk loads)
const RouteFallback = () => <div style={{ minHeight: "60vh" }} aria-busy="true" />;

// Context / data
import { AuthProvider } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";
import { useDeliveryMenu } from "./hooks/useDeliveryMenu";
import { toSlug } from "./utils/slug";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const { cartItems, addToCart, updateQuantity, removeFromCart, clearCart, bagOpen, setBagOpen } = useCart();
  const { items: products, loading: menuLoading, error: menuError } = useDeliveryMenu();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const isPrintRoute = location.pathname === '/print-menu';

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const handleAddToCart = (product) => { addToCart(product); setBagOpen(true); };
  const handleCheckout = () => { setBagOpen(false); setIsCheckoutOpen(true); };
  const handleOrderComplete = () => { clearCart(); setIsCheckoutOpen(false); };
  const handleProductClick = (product) => startTransition(() => navigate(`/product/${toSlug(product.name)}`));

  if (isPrintRoute) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/print-menu" element={<PrintMenuPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <div className="App">
      <Header />

      <main role="main" id="main-content">
        <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={
            <ProductGrid products={products} onAddToCart={handleAddToCart} onProductClick={handleProductClick} />
          } />
          <Route path="/menu" element={
            <FoodMenuPage products={products} onAddToCart={handleAddToCart} onProductClick={handleProductClick} loading={menuLoading} error={menuError} />
          } />
          <Route path="/menu/food" element={
            <FoodMenuPage products={products} onAddToCart={handleAddToCart} onProductClick={handleProductClick} loading={menuLoading} error={menuError} initialGroup="food" />
          } />
          <Route path="/menu/drinks" element={
            <FoodMenuPage products={products} onAddToCart={handleAddToCart} onProductClick={handleProductClick} loading={menuLoading} error={menuError} initialGroup="drinks" />
          } />
          <Route path="/menu/patisserie" element={
            <FoodMenuPage products={products} onAddToCart={handleAddToCart} onProductClick={handleProductClick} loading={menuLoading} error={menuError} initialGroup="patisserie" />
          } />
          <Route path="/category/:categoryId" element={
            <CategoryPage products={products} onAddToCart={handleAddToCart} onProductClick={handleProductClick} loading={menuLoading} error={menuError} />
          } />
          <Route path="/product/:productId" element={
            <ProductDetailPage products={products} onAddToCart={handleAddToCart} loading={menuLoading} />
          } />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/visit" element={<VisitPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/delivery" element={<DeliveryInfo />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          {LANDING_PAGES.map((p) => (
            <Route
              key={p.slug}
              path={`/${p.slug}`}
              element={
                <LandingPage
                  page={p}
                  products={products}
                  onAddToCart={handleAddToCart}
                  onProductClick={handleProductClick}
                />
              }
            />
          ))}
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
        </Suspense>
        </ErrorBoundary>
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
