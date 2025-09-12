import React, { useMemo, startTransition } from "react";
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
  
  // Memoize SEO data for home page
  const seoData = useMemo(() => generatePageSEO('home', {
    structuredData: [
      generateStructuredData('website'),
      generateStructuredData('restaurant'),
      generateStructuredData('breadcrumb', {
        items: [
          { name: 'Home', url: '/' },
        ]
      })
    ]
  }), []);

  // Memoize featured products calculation
  const featuredProducts = useMemo(() => {
    if (!products) return [];
    
    const bestsellers = products.filter((product) => product.bestseller);
    // If no bestsellers are marked, just take the first 6 products
    return bestsellers.length > 0 ? bestsellers : products.slice(0, 6);
  }, [products]);

  return (
    <div className="product-section">
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={seoData.url}
        structuredData={seoData.structuredData}
      />
      
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
            <button className="learn-more-btn" onClick={() => startTransition(() => navigate("/about"))}>About Us</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductGrid;