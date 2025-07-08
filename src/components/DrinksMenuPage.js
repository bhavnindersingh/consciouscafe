import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

const DrinksMenuPage = ({ products, onAddToCart, onProductClick }) => {
  const [scrollActiveCategory, setScrollActiveCategory] = useState("all");

  // Define drink categories for navigation and filtering
  const drinkCategories = [
    { id: "coffee", name: "Coffee" },
    { id: "tea", name: "Tea" },
    { id: "smoothies", name: "Smoothies" },
    { id: "juices", name: "Juices" },
    { id: "beverages", name: "Beverages" },
  ];

  // Filter products to show only drinks categories
  const drinkProducts = products.filter((product) =>
    drinkCategories.some(
      (category) =>
        product.category?.toLowerCase().includes(category.id) ||
        product.name?.toLowerCase().includes("coffee") ||
        product.name?.toLowerCase().includes("tea") ||
        product.name?.toLowerCase().includes("juice") ||
        product.name?.toLowerCase().includes("smoothie"),
    ),
  );

  // Handle category change - scroll to section instead of filtering
  const handleCategoryChange = (categoryId) => {
    if (categoryId === "all") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(`section-${categoryId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Scroll spy functionality
  useEffect(() => {
    const handleScroll = () => {
      const sections = drinkCategories.map(category => ({
        id: category.id,
        element: document.getElementById(`section-${category.id}`)
      })).filter(section => section.element);

      const scrollPosition = window.scrollY + 200; // Offset for header
      
      let currentSection = "all";
      for (const section of sections) {
        if (section.element.offsetTop <= scrollPosition) {
          currentSection = section.id;
        }
      }
      
      setScrollActiveCategory(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [drinkCategories]);

  // Get the currently active category for navigation highlighting
  const getCurrentActiveCategory = () => {
    return scrollActiveCategory;
  };

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

      {/* Category Navigation */}
      <div className="category-navigation">
        <div className="container">
          <div className="category-tabs-horizontal">
            <button
              className={`category-tab-horizontal ${getCurrentActiveCategory() === "all" ? "active" : ""}`}
              onClick={() => handleCategoryChange("all")}
            >
              All Drinks
            </button>
            {drinkCategories.map((category) => (
              <button
                key={category.id}
                className={`category-tab-horizontal ${getCurrentActiveCategory() === category.id ? "active" : ""}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Sections */}
      {drinkCategories.map((category) => {
        // Filter products for this category
        const categoryProducts = drinkProducts.filter((product) => 
          product.category?.toLowerCase().includes(category.id) ||
          product.name?.toLowerCase().includes(category.id)
        );

        if (categoryProducts.length === 0) {
          return null;
        }

        return (
          <section key={category.id} className="category-section" id={`section-${category.id}`}>
            <div className="container">
              <div className="category-header">
                <h2>{category.name}</h2>
              </div>

              <div className="products-grid">
                {categoryProducts.map((product) => (
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

      {/* Show "Coming Soon" if no drinks found */}
      {drinkProducts.length === 0 && (
        <section className="category-section">
          <div className="container">
            <div className="no-results">
              <h3>Coming Soon!</h3>
              <p>
                Our drinks menu is being prepared. Check back soon for refreshing
                options.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DrinksMenuPage;
