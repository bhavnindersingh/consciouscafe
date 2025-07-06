import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

const DrinksMenuPage = ({
  categories,
  products,
  onAddToCart,
  onProductClick,
}) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [scrollActiveCategory, setScrollActiveCategory] = useState("all");

  // Filter to get only drinks products
  const drinksProducts = products.filter(product => 
    ["juices", "mocktails", "floral-teas", "chai", "coffee"].includes(product.category)
  );

  // Initialize with bestsellers as featured products
  useEffect(() => {
    if (drinksProducts && drinksProducts.length > 0) {
      const bestsellers = drinksProducts.filter((product) => product.bestseller);
      setFeaturedProducts(
        bestsellers.length > 0 ? bestsellers : drinksProducts.slice(0, 4),
      );
    }
  }, [drinksProducts]);

  // Filter products based on search term only
  useEffect(() => {
    let filtered = [...drinksProducts];

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredProducts(filtered);
  }, [drinksProducts, searchTerm]);

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

  // Format category name for display
  const formatCategoryName = (categoryId) => {
    return categoryId
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Define drinks categories with their display information
  const drinksCategories = [
    { id: "juices", name: "Juices" },
    { id: "mocktails", name: "Mocktails" },
    { id: "floral-teas", name: "Floral Teas" },
    { id: "chai", name: "Chai" },
    { id: "coffee", name: "Coffee" },
  ];

  // Scroll spy functionality
  useEffect(() => {
    const handleScroll = () => {
      const sections = drinksCategories.map(category => ({
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
  }, [drinksCategories]);

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
              Explore our refreshing selection of conscious beverages and specialty drinks
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
              All Items
            </button>
            <button
              className={`category-tab-horizontal ${getCurrentActiveCategory() === "juices" ? "active" : ""}`}
              onClick={() => handleCategoryChange("juices")}
            >
              Juices
            </button>
            <button
              className={`category-tab-horizontal ${getCurrentActiveCategory() === "mocktails" ? "active" : ""}`}
              onClick={() => handleCategoryChange("mocktails")}
            >
              Mocktails
            </button>
            <button
              className={`category-tab-horizontal ${getCurrentActiveCategory() === "floral-teas" ? "active" : ""}`}
              onClick={() => handleCategoryChange("floral-teas")}
            >
              Floral Teas
            </button>
            <button
              className={`category-tab-horizontal ${getCurrentActiveCategory() === "chai" ? "active" : ""}`}
              onClick={() => handleCategoryChange("chai")}
            >
              Chai
            </button>
            <button
              className={`category-tab-horizontal ${getCurrentActiveCategory() === "coffee" ? "active" : ""}`}
              onClick={() => handleCategoryChange("coffee")}
            >
              Coffee
            </button>
          </div>
        </div>
      </div>


      {/* Search Results */}
      {searchTerm !== "" && (
        <section className="search-results-section">
          <div className="container">
            <div className="section-header">
              <h2>Search Results</h2>
              <p>
                {filteredProducts.length} drinks found for "{searchTerm}"
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map((product) => (
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
                <p>
                  No drinks found matching your search. Try a different keyword.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Category Sections - Only show if not searching */}
      {searchTerm === "" && (
        <>
          {drinksCategories.map((category) => {
            // Filter products for this category
            const categoryProducts = drinksProducts.filter((product) => product.category === category.id);

            if (categoryProducts.length === 0) {
              return null;
            }

            return (
              <section key={category.id} className="category-section" id={`section-${category.id}`}>
                <div className="container">
                  <div className="category-header">
                    <h2>{category.name}</h2>
                    <Link
                      to={`/drinks/category/${category.id}`}
                      className="view-all-link"
                    >
                      View All {category.name}
                    </Link>
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
        </>
      )}

    </div>
  );
};

export default DrinksMenuPage;