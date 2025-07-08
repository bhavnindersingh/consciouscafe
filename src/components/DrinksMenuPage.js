import React from "react";
import ProductCard from "./ProductCard";

const DrinksMenuPage = ({ products, onAddToCart, onProductClick }) => {
  // Filter products to show only drinks categories
  const drinkCategories = ["beverages", "coffee", "tea", "smoothies", "juices"];

  const drinkProducts = products.filter((product) =>
    drinkCategories.some(
      (category) =>
        product.category?.toLowerCase().includes(category) ||
        product.name?.toLowerCase().includes("coffee") ||
        product.name?.toLowerCase().includes("tea") ||
        product.name?.toLowerCase().includes("juice") ||
        product.name?.toLowerCase().includes("smoothie"),
    ),
  );

  return (
    <div className="food-menu-page">
      {/* Hero Section */}
      <div className="hero food-menu-hero">
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1200&h=300&fit=crop&crop=center" 
            alt="Drinks Menu" 
            className="hero-bg-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1>Drinks Menu</h1>
            <p>
              Refreshing beverages to complement your meal
            </p>
          </div>
        </div>
      </div>

      {/* Drinks Section */}
      <section className="category-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Beverages</h2>
            <p>Discover our selection of refreshing drinks</p>
          </div>

          {drinkProducts.length > 0 ? (
            <div className="products-grid">
              {drinkProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onProductClick={onProductClick}
                />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <h3>Coming Soon!</h3>
              <p>
                Our drinks menu is being prepared. Check back soon for refreshing
                options.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DrinksMenuPage;
