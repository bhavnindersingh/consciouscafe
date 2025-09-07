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
  

  return (
    <div>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="header" role="banner">
        {/* Main Header */}
        <div className="header-main">
          <div className="container">
            <div className="header-content">
              {/* Mobile Burger Menu - Left Side */}
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

              {/* Left Navigation - Desktop only */}
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

              {/* Right Actions - Cart only */}
              <div className="header-actions">
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
