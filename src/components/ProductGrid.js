import React from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

const ProductGrid = ({
  products,
  onAddToCart,
  onProductClick,
  onCategoryChange,
  categories,
}) => {
  const navigate = useNavigate();

  // Use categories from props instead of defining them here
  const displayCategories = categories || [];

  // Get ALL bestseller products (both food and drinks)
  const featuredProducts = products
    ? products.filter((product) => product.bestseller)
    : [];
  // If no bestsellers are marked, just take the first 6 products
  if (featuredProducts.length === 0 && products) {
    featuredProducts.push(...products.slice(0, 6));
  }

  return (
    <div className="product-section">
      {/* Hero Section */}
      <section className="hero">
        {/* Video Backdrop */}
        <div className="hero-video-backdrop">
          <video
            autoPlay
            muted
            controls={false}
            playsInline
            loop
            className="hero-background-video"
          >
            <source
              type="video/mp4"
              src="https://cdn.builder.io/o/assets%2F9813a8427ba5406c83ac4c926732fea1%2F63f4ca45502342e49dedb33601103eac?alt=media&token=34e40572-03d4-44c7-934d-596f265673f4&apiKey=9813a8427ba5406c83ac4c926732fea1"
            />
          </video>
          <div className="hero-video-overlay"></div>
        </div>

        <div className="container">
          <div className="hero-content">
            <h1>
              <span style={{ color: "#ffffff" }}>Conscious Cafe</span>
            </h1>
            <p>
              <span style={{ color: "#ffffff" }}>
                Experience our artisanal food and beverages made with conscious
                ingredients
              </span>
            </p>
            <div style={{display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap'}}>
              <button className="cta-btn" onClick={() => navigate("/menu")}>
                View Food Menu
              </button>
              <button className="cta-btn" onClick={() => navigate("/drinks")}>
                View Drinks Menu
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Favorites Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Bestsellers</h2>
            <p>
              Discover our most loved food and drinks, crafted with care
              and quality ingredients.
            </p>
          </div>

          <div className="featured-products-grid">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onProductClick={onProductClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="instagram-section">
        <div className="container">
          <div className="section-header">
            <h2>Follow Our Journey</h2>
            <p>
              Stay connected with us on Instagram for daily inspiration, 
              behind-the-scenes moments, and delicious food photography.
            </p>
          </div>
          
          <div className="instagram-content">
            <div className="instagram-info">
              <div className="instagram-handle">
                <span className="instagram-icon">📸</span>
                <h3>@consciouscafe.kavas</h3>
              </div>
              <p>
                Join our community of conscious food lovers and get inspired 
                by our daily creations, sustainable practices, and the stories 
                behind every dish.
              </p>
              <div className="instagram-stats">
                <div className="stat">
                  <span className="stat-number">🌱</span>
                  <span className="stat-label">Conscious Cooking</span>
                </div>
                <div className="stat">
                  <span className="stat-number">📷</span>
                  <span className="stat-label">Daily Updates</span>
                </div>
                <div className="stat">
                  <span className="stat-number">🍽️</span>
                  <span className="stat-label">Food Stories</span>
                </div>
              </div>
              <a 
                href="https://instagram.com/consciouscafe.kavas" 
                target="_blank" 
                rel="noopener noreferrer"
                className="instagram-follow-btn"
              >
                Follow Us on Instagram
              </a>
            </div>
            
            <div className="instagram-preview">
              <div className="instagram-grid">
                <div className="instagram-post">
                  <img 
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop" 
                    alt="Instagram post" 
                  />
                </div>
                <div className="instagram-post">
                  <img 
                    src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=300&fit=crop" 
                    alt="Instagram post" 
                  />
                </div>
                <div className="instagram-post">
                  <img 
                    src="https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300&h=300&fit=crop" 
                    alt="Instagram post" 
                  />
                </div>
                <div className="instagram-post">
                  <img 
                    src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=300&fit=crop" 
                    alt="Instagram post" 
                  />
                </div>
                <div className="instagram-post">
                  <img 
                    src="https://images.unsplash.com/photo-1565299507177-b0ac66763ed1?w=300&h=300&fit=crop" 
                    alt="Instagram post" 
                  />
                </div>
                <div className="instagram-post">
                  <img 
                    src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=300&fit=crop" 
                    alt="Instagram post" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <h2>
              Welcome to Conscious Cafe, where every dish tells a story of
              quality and care.
            </h2>
            <button className="learn-more-btn" onClick={() => navigate("/about")}>About Us</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductGrid;
