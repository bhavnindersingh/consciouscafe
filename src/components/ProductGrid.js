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

  // Get featured products (bestsellers)
  const featuredProducts = products
    ? products.filter((product) => product.bestseller).slice(0, 4)
    : [];
  // If no bestsellers are marked, just take the first 4 products
  if (featuredProducts.length === 0 && products) {
    featuredProducts.push(...products.slice(0, 4));
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
              <span style={{ color: "rgb(255, 255, 255)" }}>
                Conscious Cafe
              </span>
            </h1>
            <p>
              <span style={{ color: "rgb(255, 255, 255)" }}>
                Experience our artisanal food and beverages made with conscious
                ingredients
              </span>
            </p>
            <button className="cta-btn" onClick={() => navigate("/menu")}>
              View Full Food Menu
            </button>
          </div>
        </div>
      </section>
      {/* Category Navigation */}
      <div className="category-navigation">
        <div className="container">
          <div className="category-tabs-horizontal">
            <button
              className="category-tab-horizontal active"
              onClick={() => navigate("/menu")}
            >
              All Items
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => navigate("/menu")}
            >
              Toast
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => navigate("/menu")}
            >
              All Day Breakfast
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => navigate("/menu")}
            >
              Smoothie Bowls
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => navigate("/menu")}
            >
              Earth Grills/Crisps
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => navigate("/menu")}
            >
              Salads
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => navigate("/menu")}
            >
              Platters
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => navigate("/menu")}
            >
              Earth Bowls
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => navigate("/menu")}
            >
              Noodle Bowls
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => navigate("/menu")}
            >
              Pasta/Pizza
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => navigate("/menu")}
            >
              Desserts
            </button>
          </div>
        </div>
      </div>

      {/* Our Favorites Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Favorites</h2>
            <p>
              Discover our most loved dishes and beverages, crafted with care
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

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <h2>
              Welcome to Conscious Cafe, where every dish tells a story of
              quality and care.
            </h2>
            <button className="learn-more-btn">About Us</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductGrid;
