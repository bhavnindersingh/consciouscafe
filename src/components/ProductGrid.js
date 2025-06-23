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
        <div className="container">
          <div className="hero-content">
            <h1>Conscious Cafe</h1>
            <p>
              Experience our artisanal food and beverages made with conscious
              ingredients
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
