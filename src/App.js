import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import FoodMenuPage from "./components/FoodMenuPage";
import DrinksMenuPage from "./components/DrinksMenuPage";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import ProductDetailPage from "./components/ProductDetailPage";
import ProductPage from "./components/ProductPage";
import CategoryPage from "./components/CategoryPage";
import Footer from "./components/Footer";
import AboutUs from "./components/AboutUs";
import Contact from "./components/Contact";
import DeliveryInfo from "./components/DeliveryInfo";
import { products } from "./data/products";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProductPageOpen, setIsProductPageOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Define all categories to be displayed - moved from ProductGrid
  const displayCategories = [
    {
      id: "toast",
      name: "Toast",
      icon: "🍞",
      description: "Artisanal toasts with various toppings",
    },
    {
      id: "all-day-breakfast",
      name: "All Day Breakfast",
      icon: "🍳",
      description: "Breakfast favorites served all day",
    },
    {
      id: "smoothie-bowls",
      name: "Smoothie Bowls",
      icon: "🥣",
      description: "Nutritious and refreshing smoothie bowls",
    },
    {
      id: "earth-grills-crisps",
      name: "Earth Grills/Crisps",
      icon: "🌽",
      description: "Grilled vegetables and crispy snacks",
    },
    {
      id: "salads",
      name: "Salads",
      icon: "🥗",
      description: "Fresh and healthy salad options",
    },
    {
      id: "platters",
      name: "Platters",
      icon: "🍽️",
      description: "Sharing platters for groups",
    },
    {
      id: "earth-bowls",
      name: "Earth Bowls",
      icon: "🥙",
      description: "Wholesome bowls packed with goodness",
    },
    {
      id: "noodle-bowls",
      name: "Noodle Bowls",
      icon: "🍜",
      description: "Flavorful noodle dishes from around the world",
    },
    {
      id: "pasta-pizza",
      name: "Pasta/Pizza",
      icon: "🍕",
      description: "Italian classics with a conscious twist",
    },
    {
      id: "desserts",
      name: "Desserts",
      icon: "🍰",
      description: "Sweet treats to end your meal",
    },
  ];

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem("consciousBakesCart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem("consciousBakesCart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Scroll to top whenever location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item,
        );
      } else {
        return [...prevItems, { ...product, quantity: product.quantity || 1 }];
      }
    });

    // Auto-open cart when item is added
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId),
    );
  };

  const clearCart = () => {
    setCartItems([]);
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
    if (category === "all") {
      navigate("/");
    } else {
      navigate(`/category/${category}`);
    }
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
    
    navigate(`/product/${createSlug(product.name)}`);
  };

  // For backward compatibility with modal approach
  const handleProductPageClose = () => {
    setIsProductPageOpen(false);
    setSelectedProduct(null);
  };

  return (
    <HelmetProvider>
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
                onAddToCart={addToCart}
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
                onAddToCart={addToCart}
                onProductClick={handleProductClick}
              />
            }
          />
          <Route
            path="/drinks"
            element={
              <DrinksMenuPage
                products={products}
                onAddToCart={addToCart}
                onProductClick={handleProductClick}
              />
            }
          />
          <Route
            path="/drinks/category/:categoryId"
            element={
              <CategoryPage 
                products={products} 
                onAddToCart={addToCart}
                onProductClick={handleProductClick}
              />
            }
          />
          <Route
            path="/category/:categoryId"
            element={
              <CategoryPage 
                products={products} 
                onAddToCart={addToCart}
                onProductClick={handleProductClick}
              />
            }
          />
          <Route
            path="/product/:productId"
            element={
              <ProductDetailPage products={products} onAddToCart={addToCart} />
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
        onAddToCart={addToCart}
      />
      </div>
    </HelmetProvider>
  );
}

export default App;