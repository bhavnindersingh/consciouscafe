import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import SEO from "./SEO";
import { generatePageSEO, generateStructuredData } from "../utils/seoData";

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
  }, [drinkCategories]);

  // JavaScript sticky navigation - Hero visibility based
  useEffect(() => {
    let ticking = false;
    
    const calculateStickyTrigger = () => {
      const heroElement = document.querySelector('.food-menu-hero'); // DrinksMenuPage uses same hero class
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

  // Generate SEO data for drinks menu page
  const seoData = generatePageSEO('drinks', {
    structuredData: [
      generateStructuredData('restaurant'),
      generateStructuredData('breadcrumb', {
        items: [
          { name: 'Home', url: '/' },
          { name: 'Drinks Menu', url: '/drinks' },
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
