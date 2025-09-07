import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import SEO from "./SEO";
import { generatePageSEO, generateStructuredData } from "../utils/seoData";

const FoodMenuPage = ({
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

  // Initialize with bestsellers as featured products
  useEffect(() => {
    if (products && products.length > 0) {
      const bestsellers = products.filter((product) => product.bestseller);
      setFeaturedProducts(
        bestsellers.length > 0 ? bestsellers : products.slice(0, 4),
      );
    }
  }, [products]);

  // Filter products based on search term only
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm]);

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

  // Scroll spy functionality
  useEffect(() => {
    const handleScroll = () => {
      const sections = categories.map(category => ({
        id: category.id,
        element: document.getElementById(`section-${category.id}`)
      })).filter(section => section.element);

      // Better mobile-responsive offset calculation
      const isMobile = window.innerWidth <= 768;
      const headerHeight = isMobile ? 120 : 140; // Adjust for mobile header
      const viewportHeight = window.innerHeight;
      const scrollPosition = window.scrollY + (viewportHeight * 0.3); // Use 30% of viewport height
      
      let currentSection = "all";
      
      // Improved section detection algorithm
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const nextSection = sections[i + 1];
        
        const sectionTop = section.element.offsetTop - headerHeight;
        const sectionBottom = nextSection 
          ? nextSection.element.offsetTop - headerHeight
          : document.documentElement.scrollHeight;
        
        // Check if scroll position is within this section's bounds
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          currentSection = section.id;
          break;
        }
      }
      
      setScrollActiveCategory(currentSection);
    };

    // Throttle scroll events for better performance on mobile
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [categories]);

  // JavaScript sticky navigation - Hero visibility based
  useEffect(() => {
    let ticking = false;
    
    const calculateStickyTrigger = () => {
      const heroElement = document.querySelector('.food-menu-hero');
      if (!heroElement) return 150; // fallback
      
      const heroHeight = heroElement.offsetHeight;
      const heroTop = heroElement.offsetTop;
      const isMobile = window.innerWidth <= 768;
      const triggerPercentage = isMobile ? 0.6 : 0.75;
      
      return heroTop + (heroHeight * triggerPercentage);
    };
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const categoryNav = document.querySelector('.category-navigation');
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const triggerPoint = calculateStickyTrigger();
          
          if (categoryNav) {
            if (scrollTop > triggerPoint) {
              categoryNav.classList.add('sticky');
              categoryNav.classList.remove('static');
            } else {
              categoryNav.classList.remove('sticky');
              categoryNav.classList.add('static');
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial calculation and event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true }); // Recalculate on resize
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);


  // Get the currently active category for navigation highlighting
  const getCurrentActiveCategory = () => {
    return scrollActiveCategory;
  };

  // Auto-scroll navigation bar to show active category
  useEffect(() => {
    const scrollNavigationToActive = () => {
      const navigationContainer = document.querySelector('.category-tabs-horizontal');
      const activeTab = document.querySelector(`.category-tab-horizontal.active`);
      
      if (navigationContainer && activeTab) {
        const containerRect = navigationContainer.getBoundingClientRect();
        const activeTabRect = activeTab.getBoundingClientRect();
        
        // Calculate scroll position to center the active tab
        const scrollLeft = activeTab.offsetLeft - (containerRect.width / 2) + (activeTabRect.width / 2);
        
        // Smooth scroll the navigation container
        navigationContainer.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    };

    // Trigger auto-scroll when active category changes
    scrollNavigationToActive();
  }, [scrollActiveCategory]);

  // Generate SEO data for food menu page
  const seoData = generatePageSEO('menu', {
    structuredData: [
      generateStructuredData('restaurant'),
      generateStructuredData('breadcrumb', {
        items: [
          { name: 'Home', url: '/' },
          { name: 'Food Menu', url: '/menu' },
        ]
      })
    ]
  });

  return (
    <div className="food-menu-page">
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={seoData.url}
        structuredData={seoData.structuredData}
      />
      {/* Hero Section */}
      <div className="hero food-menu-hero">
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=300&fit=crop&crop=center" 
            alt="Food Menu" 
            className="hero-bg-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1>Food Menu</h1>
            <p>
              Explore our complete selection of conscious food and beverages
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
              className={`category-tab-horizontal ${getCurrentActiveCategory() === "toast" ? "active" : ""}`}
              onClick={() => handleCategoryChange("toast")}
            >
              Toast
            </button>
            <button
              className={`category-tab-horizontal ${getCurrentActiveCategory() === "all-day-breakfast" ? "active" : ""}`}
              onClick={() => handleCategoryChange("all-day-breakfast")}
            >
              All Day Breakfast
            </button>
            <button
              className={`category-tab-horizontal ${getCurrentActiveCategory() === "smoothie-bowls" ? "active" : ""}`}
              onClick={() => handleCategoryChange("smoothie-bowls")}
            >
              Smoothie Bowls
            </button>
            <button
              className={`category-tab-horizontal ${getCurrentActiveCategory() === "earth-grills-crisps" ? "active" : ""}`}
              onClick={() => handleCategoryChange("earth-grills-crisps")}
            >
              Earth Grills/Crisps
            </button>
            <button
              className={`category-tab-horizontal ${getCurrentActiveCategory() === "salads" ? "active" : ""}`}
              onClick={() => handleCategoryChange("salads")}
            >
              Salads
            </button>
            <button
              className={`category-tab-horizontal ${getCurrentActiveCategory() === "platters" ? "active" : ""}`}
              onClick={() => handleCategoryChange("platters")}
            >
              Platters
            </button>
            <button
              className={`category-tab-horizontal ${getCurrentActiveCategory() === "earth-bowls" ? "active" : ""}`}
              onClick={() => handleCategoryChange("earth-bowls")}
            >
              Earth Bowls
            </button>
            <button
              className={`category-tab-horizontal ${getCurrentActiveCategory() === "noodle-bowls" ? "active" : ""}`}
              onClick={() => handleCategoryChange("noodle-bowls")}
            >
              Noodle Bowls
            </button>
            <button
              className={`category-tab-horizontal ${getCurrentActiveCategory() === "pasta-pizza" ? "active" : ""}`}
              onClick={() => handleCategoryChange("pasta-pizza")}
            >
              Pasta/Pizza
            </button>
            <button
              className={`category-tab-horizontal ${getCurrentActiveCategory() === "desserts" ? "active" : ""}`}
              onClick={() => handleCategoryChange("desserts")}
            >
              Desserts
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
                {filteredProducts.length} items found for "{searchTerm}"
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
                  No items found matching your search. Try a different keyword.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Category Sections - Only show if not searching */}
      {searchTerm === "" && (
        <>
          {categories.map((category) => {
            // Filter products for this category
            const categoryProducts = products.filter((product) => product.category === category.id);

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
        </>
      )}

    </div>
  );
};

export default FoodMenuPage;
