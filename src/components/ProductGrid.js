import React from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import InstagramFeed from "./InstagramFeed";
import SEO from "./SEO";
import { generatePageSEO, generateStructuredData } from "../utils/seoData";

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
  
  // Generate SEO data for home page
  const seoData = generatePageSEO('home', {
    structuredData: [
      generateStructuredData('website'),
      generateStructuredData('restaurant'),
      generateStructuredData('breadcrumb', {
        items: [
          { name: 'Home', url: '/' },
        ]
      })
    ]
  });

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
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={seoData.url}
        structuredData={seoData.structuredData}
      />
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
          <InstagramFeed />
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
