import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Header = ({ cartItems, onCartToggle, onCategoryChange, categories }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check current page types
  const isHomePage = location.pathname === '/';
  const isProductPage = location.pathname.startsWith('/product/');
  const isFoodCategoryPage = location.pathname.startsWith('/category/');
  const isFoodMenuPage = location.pathname === '/menu';
  const isDrinksCategoryPage = location.pathname.startsWith('/drinks/category/');
  const isDrinksMenuPage = location.pathname === '/drinks';

  // Use categories from props if available, otherwise use default
  const menuCategories = categories || [
    { id: "toast", name: "Toast" },
    { id: "all-day-breakfast", name: "All Day Breakfast" },
    { id: "smoothie-bowls", name: "Smoothie Bowls" },
    { id: "earth-grills-crisps", name: "Earth Grills/Crisps" },
    { id: "salads", name: "Salads" },
    { id: "platters", name: "Platters" },
    { id: "earth-bowls", name: "Earth Bowls" },
    { id: "noodle-bowls", name: "Noodle Bowls" },
    { id: "pasta-pizza", name: "Pasta/Pizza" },
    { id: "desserts", name: "Desserts" },
  ];

  const drinksCategories = [
    { id: "juices", name: "Juices" },
    { id: "mocktails", name: "Mocktails" },
    { id: "floral-teas", name: "Floral Teas" },
    { id: "chai", name: "Chai" },
    { id: "coffee", name: "Coffee" },
  ];

  return (
    <div>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="header" role="banner">
        {/* Top Navigation Bar - Show subcategories only on category pages */}
        {(isFoodCategoryPage || isDrinksCategoryPage) && (
          <div className="top-nav-bar">
            <div className="container">
              <nav className="top-nav" role="navigation" aria-label="Category navigation">
                {isFoodCategoryPage && menuCategories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    className={`top-nav-item ${location.pathname === `/category/${category.id}` ? 'active' : ''}`}
                  >
                    {category.name}
                  </Link>
                ))}
                {isDrinksCategoryPage && drinksCategories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/drinks/category/${category.id}`}
                    className={`top-nav-item ${location.pathname === `/drinks/category/${category.id}` ? 'active' : ''}`}
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
        
        {/* Main Header */}
        <div className="header-main">
          <div className="container">
            <div className="header-content">
              {/* Left Navigation - Always show */}
              <nav
                className="desktop-nav"
                role="navigation"
                aria-label="Main navigation"
              >
                <Link to="/" className="nav-title">
                  Home
                </Link>
                <Link to="/menu" className="nav-title">
                  Food
                </Link>
                <Link to="/drinks" className="nav-title">
                  Drinks
                </Link>
              </nav>

              {/* Center Logo */}
              <div className="logo">
                <Link to="/">
                  <img
                    src="/android-icon-192x192.png"
                    alt="Conscious Cafe"
                    className="logo-img"
                  />
                </Link>
              </div>

              {/* Right Actions */}
              <div className="header-actions">
                <button
                  type="button"
                  className="mobile-menu-btn"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Toggle mobile menu"
                  aria-expanded={isMenuOpen}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 12H21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M3 6H21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M3 18H21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="cart-btn"
                  onClick={onCartToggle}
                  aria-label={`Shopping cart with ${cartItemCount} items`}
                >
                  <span className="cart-text">Bag</span>
                  <svg
                    className="cart-icon"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                  >
                    <path
                      fill="currentColor"
                      d="M17 18a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2c0-1.11.89-2 2-2M1 2h3.27l.94 2H20a1 1 0 0 1 1 1c0 .17-.05.34-.12.5l-3.58 6.47c-.34.61-1 1.03-1.8 1.03H8.1l-.9 1.63-.03.12a.25.25 0 0 0 .25.25H19v2H7a2 2 0 0 1-2-2c0-.35.09-.68.24-.96l1.36-2.45L3 4H1V2m6 16a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2c0-1.11.89-2 2-2m9-7l2.78-5H6.14l4.72 5H16Z"
                    />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="cart-badge">{cartItemCount}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            className="mobile-nav"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="container">
              <Link
                to="/"
                className="mobile-nav-item"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/menu"
                className="mobile-nav-item"
                onClick={() => setIsMenuOpen(false)}
              >
                Food Menu
              </Link>
              <Link
                to="/drinks"
                className="mobile-nav-item"
                onClick={() => setIsMenuOpen(false)}
              >
                Drinks Menu
              </Link>
              <Link
                to="/about"
                className="mobile-nav-item"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="mobile-nav-item"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/delivery"
                className="mobile-nav-item"
                onClick={() => setIsMenuOpen(false)}
              >
                Delivery
              </Link>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Header;
