import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const FoodMenuPage = ({ categories, products, onAddToCart, onProductClick }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // Initialize with bestsellers as featured products
  useEffect(() => {
    if (products && products.length > 0) {
      const bestsellers = products.filter(product => product.bestseller);
      setFeaturedProducts(bestsellers.length > 0 ? bestsellers : products.slice(0, 4));
    }
  }, [products]);

  // Filter products based on search term and active category
  useEffect(() => {
    let filtered = [...products];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, activeCategory]);

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  // Format category name for display
  const formatCategoryName = (categoryId) => {
    return categoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="food-menu-page">
      {/* Hero Section */}
      <div className="hero food-menu-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Food Menu</h1>
            <p>Explore our complete selection of conscious food and beverages</p>
            
            {/* Search Bar */}
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search for dishes..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="category-navigation">
        <div className="container">
          <div className="category-tabs">
            <button 
              className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('all')}
            >
              All Items
            </button>
            
            {categories.map(category => (
              <button 
                key={category.id}
                className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products Section - Only show if not filtering */}
      {activeCategory === 'all' && searchTerm === '' && featuredProducts.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2>Featured Items</h2>
              <p>Our most popular and loved dishes</p>
            </div>
            
            <div className="featured-products-grid">
              {featuredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onProductClick={onProductClick}
                  featured={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search Results */}
      {searchTerm !== '' && (
        <section className="search-results-section">
          <div className="container">
            <div className="section-header">
              <h2>Search Results</h2>
              <p>{filteredProducts.length} items found for "{searchTerm}"</p>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map(product => (
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
                <p>No items found matching your search. Try a different keyword.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Category Sections - Only show if not searching */}
      {searchTerm === '' && (
        <>
          {categories.map(category => {
            // Filter products for this category
            const categoryProducts = activeCategory === 'all' 
              ? products.filter(product => product.category === category.id)
              : activeCategory === category.id ? filteredProducts : [];
            
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
        </>
      )}

      {/* No items in selected category */}
      {activeCategory !== 'all' && filteredProducts.length === 0 && searchTerm === '' && (
        <div className="no-items-message">
          <div className="container">
            <p>No items available in this category at the moment.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodMenuPage;
