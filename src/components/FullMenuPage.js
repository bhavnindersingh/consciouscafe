import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const FullMenuPage = ({ categories, products, onAddToCart, onProductClick }) => {
  return (
    <div className="full-menu-page">
      <div className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Full Food Menu</h1>
            <p>Explore our complete selection of conscious food and beverages</p>
          </div>
        </div>
      </div>

      {categories.map(category => {
        const categoryProducts = products.filter(product => product.category === category.id);
        
        if (categoryProducts.length === 0) {
          return null;
        }
        
        return (
          <section key={category.id} className="category-section">
            <div className="container">
              <div className="category-header">
                <h2>{category.name}</h2>
                <Link to={`/category/${category.id}`} className="view-all-link">
                  View All {category.name}
                </Link>
              </div>
              
              <div className="products-grid">
                {categoryProducts.map(product => (
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
        );
      })}
    </div>
  );
};

export default FullMenuPage;
