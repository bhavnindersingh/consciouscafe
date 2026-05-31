import React, { useState, useMemo, useEffect, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../ProductCard/ProductCard";
import InstagramFeed from "../../social/InstagramFeed/InstagramFeed";
import SEO from "../../seo/SEO/SEO";
import { generatePageSEO, generateStructuredData } from "../../../utils/seoData";

const ProductGrid = ({
  products,
  onAddToCart,
  onProductClick,
  onCategoryChange,
  categories = [],
  mainCategories = [],
}) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);

  const seoData = useMemo(() => generatePageSEO('home', {
    structuredData: [
      generateStructuredData('website'),
      generateStructuredData('restaurant'),
      generateStructuredData('breadcrumb', { items: [{ name: 'Home', url: '/' }] })
    ]
  }), []);

  // Default to first sub-category once data loads
  React.useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Products filtered by selected sub-category
  const displayProducts = useMemo(() => {
    if (!products || !activeCategory) return [];
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const featuredProducts = useMemo(() => displayProducts.slice(0, 6), [displayProducts]);

  // Scroll active category tab to center when it changes
  useEffect(() => {
    const nav = document.querySelector('.home-category-nav .category-tabs-horizontal');
    const active = document.querySelector('.home-category-nav .category-tab-horizontal.active');
    if (nav && active) {
      const scrollLeft = active.offsetLeft - nav.clientWidth / 2 + active.offsetWidth / 2;
      nav.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategory]);

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
  };

  return (
    <div className="product-section">
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={seoData.url}
        structuredData={seoData.structuredData}
      />

      {/* Dynamic category filter bar */}
      {categories.length > 0 && (
        <div className="home-category-nav">
          <div className="container">
            <div className="category-tabs-horizontal">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-tab-horizontal ${activeCategory === cat.id ? "active" : ""}`}
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured / filtered products */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>{categories.find(c => c.id === activeCategory)?.name || ""}</h2>
          </div>

          {featuredProducts.length > 0 ? (
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
          ) : (
            <div className="menu-status-message">
              <p>No items in this category yet.</p>
            </div>
          )}

          {activeCategory && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button
                className="learn-more-btn"
                onClick={() => startTransition(() => navigate(`/category/${activeCategory}`))}
              >
                View All {categories.find(c => c.id === activeCategory)?.name}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Instagram Section */}
      <section className="instagram-section">
        <div className="container">
          <InstagramFeed />
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <h2>Welcome to Conscious Cafe, where every dish tells a story of quality and care.</h2>
            <button className="learn-more-btn" onClick={() => startTransition(() => navigate("/about"))}>
              About Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductGrid;
