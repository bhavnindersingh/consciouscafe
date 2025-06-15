import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, onAddToCart, onProductClick, onCategoryChange, categories }) => {
  const navigate = useNavigate();
  
  // Use categories from props instead of defining them here
  const displayCategories = categories || [];

  // Get featured products (bestsellers)
  const featuredProducts = products ? products.filter(product => product.bestseller).slice(0, 4) : [];
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
            <p>Experience our artisanal food and beverages made with conscious ingredients</p>
            <button className="cta-btn" onClick={() => navigate('/menu')}>View Full Food Menu</button>
          </div>
          
          <div className="hero-categories">
            {displayCategories.map(category => (
              <div 
                key={category.id} 
                className="category-card" 
                onClick={() => onCategoryChange(category.id)}
              >
                <div className="category-icon">{category.icon}</div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Favorites Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Favorites</h2>
            <p>Discover our most loved dishes and beverages, crafted with care and quality ingredients.</p>
          </div>
          
          <div className="featured-products-grid">
            {featuredProducts.map(product => (
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
            <h2>Welcome to Conscious Cafe, where every dish tells a story of quality and care.</h2>
            <button className="learn-more-btn">About Us</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductGrid;
