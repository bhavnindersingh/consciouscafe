import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import ProductGrid from "./components/ProductGrid";
import CategoryPage from "./components/CategoryPage";
import FoodMenuPage from "./components/FoodMenuPage";
import ProductDetailPage from "./components/ProductDetailPage";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import ProductPage from "./components/ProductPage";
import Footer from "./components/Footer";
import { products } from "./data/products";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

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
    navigate(`/product/${product.id}`);
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

      <main role="main">
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
            path="/category/:categoryId"
            element={
              <CategoryPage
                products={products}
                onAddToCart={addToCart}
                onProductClick={handleProductClick}
                category={location.pathname.split("/")[2]}
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
            path="/product/:productId"
            element={
              <ProductDetailPage products={products} onAddToCart={addToCart} />
            }
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
  );
}

export default App;
