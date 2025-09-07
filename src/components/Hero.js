import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const [videoError, setVideoError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const scrollContainerRef = useRef(null);

  // Food menu categories to display in the slider
  const foodCategories = [
    { id: "all", name: "All Items" },
    { id: "toast", name: "Toast" },
    { id: "all-day-breakfast", name: "All Day Breakfast" },
    { id: "smoothie-bowls", name: "Smoothie Bowls" },
    { id: "earth-grills-crisps", name: "Earth Grills/Crisps" },
    { id: "salads", name: "Salads" },
    { id: "platters", name: "Platters" },
    { id: "earth-bowls", name: "Earth Bowls" },
    { id: "noodle-bowls", name: "Noodle Bowls" },
    { id: "pasta-pizza", name: "Pasta/Pizza" },
  ];

  const scrollToCenter = (element) => {
    if (scrollContainerRef.current && element) {
      const container = scrollContainerRef.current;
      const elementLeft = element.offsetLeft;
      const elementWidth = element.offsetWidth;
      const containerWidth = container.clientWidth;
      
      const scrollLeft = elementLeft - (containerWidth / 2) + (elementWidth / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryClick = (categoryId, type = "food") => {
    setSelectedCategory(categoryId);
    
    // Find the clicked button and scroll to center it
    setTimeout(() => {
      const button = document.querySelector(`[data-category-id="${categoryId}"]`);
      if (button) {
        scrollToCenter(button);
      }
    }, 50);

    if (categoryId === "all") {
      navigate("/menu");
    } else if (categoryId === "all-drinks") {
      navigate("/drinks");
    } else if (type === "drinks") {
      navigate(`/drinks/category/${categoryId}`);
    } else {
      navigate(`/category/${categoryId}`);
    }
  };

  useEffect(() => {
    // Enhanced Sirv initialization for Netlify
    const initSirv = () => {
      if (window.Sirv) {
        try {
          window.Sirv.start();
        } catch (error) {
          console.warn('Sirv initialization failed:', error);
        }
      }
    };

    // Initialize immediately if Sirv is available
    if (window.Sirv) {
      initSirv();
    } else {
      // Wait for Sirv to load
      const checkSirv = setInterval(() => {
        if (window.Sirv) {
          initSirv();
          clearInterval(checkSirv);
        }
      }, 100);
      
      // Clear interval after 5 seconds
      setTimeout(() => clearInterval(checkSirv), 5000);
    }
  }, []);

  // JavaScript sticky navigation - Hero visibility based
  useEffect(() => {
    let ticking = false;
    
    const calculateStickyTrigger = () => {
      const heroElement = document.querySelector('.hero');
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


  return (
    <div>
      <section className="hero">
        <div className="hero-video-backdrop">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            preload="metadata"
            onError={() => setVideoError(true)}
            style={{ display: videoError ? 'none' : 'block' }}
          >
            <source src="https://consciouscafe.sirv.com/CCOpenshotvideo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {videoError && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #f4f2f0 0%, #ffffff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/android-icon-192x192.png" 
                alt="Conscious Cafe" 
                style={{ opacity: 0.1, maxWidth: '200px' }}
              />
            </div>
          )}
        </div>
        
        <div className="hero-video-overlay"></div>

        <div className="container">
          <div className="hero-content">
            <h1>Conscious Cafe</h1>
            <div className="hero-buttons">
              <button className="cta-btn" onClick={() => navigate('/menu')}>
                View Food Menu
              </button>
              <button className="cta-btn" onClick={() => navigate('/drinks')}>
                View Drinks Menu
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Food & Drinks Menu Category Navigation */}
      <div className="category-navigation">
        <div className="container">
          <div className="category-tabs-horizontal" ref={scrollContainerRef}>
            {/* Food Categories */}
            <button
              className={`category-tab-horizontal ${selectedCategory === "all" ? "active" : ""}`}
              onClick={() => handleCategoryClick("all")}
              data-category-id="all"
            >
              All Items
            </button>
            <button
              className={`category-tab-horizontal ${selectedCategory === "toast" ? "active" : ""}`}
              onClick={() => handleCategoryClick("toast")}
              data-category-id="toast"
            >
              Toast
            </button>
            <button
              className={`category-tab-horizontal ${selectedCategory === "all-day-breakfast" ? "active" : ""}`}
              onClick={() => handleCategoryClick("all-day-breakfast")}
              data-category-id="all-day-breakfast"
            >
              All Day Breakfast
            </button>
            <button
              className={`category-tab-horizontal ${selectedCategory === "smoothie-bowls" ? "active" : ""}`}
              onClick={() => handleCategoryClick("smoothie-bowls")}
              data-category-id="smoothie-bowls"
            >
              Smoothie Bowls
            </button>
            <button
              className={`category-tab-horizontal ${selectedCategory === "earth-grills-crisps" ? "active" : ""}`}
              onClick={() => handleCategoryClick("earth-grills-crisps")}
              data-category-id="earth-grills-crisps"
            >
              Earth Grills/Crisps
            </button>
            <button
              className={`category-tab-horizontal ${selectedCategory === "salads" ? "active" : ""}`}
              onClick={() => handleCategoryClick("salads")}
              data-category-id="salads"
            >
              Salads
            </button>
            <button
              className={`category-tab-horizontal ${selectedCategory === "platters" ? "active" : ""}`}
              onClick={() => handleCategoryClick("platters")}
              data-category-id="platters"
            >
              Platters
            </button>
            <button
              className={`category-tab-horizontal ${selectedCategory === "earth-bowls" ? "active" : ""}`}
              onClick={() => handleCategoryClick("earth-bowls")}
              data-category-id="earth-bowls"
            >
              Earth Bowls
            </button>
            <button
              className={`category-tab-horizontal ${selectedCategory === "noodle-bowls" ? "active" : ""}`}
              onClick={() => handleCategoryClick("noodle-bowls")}
              data-category-id="noodle-bowls"
            >
              Noodle Bowls
            </button>
            <button
              className={`category-tab-horizontal ${selectedCategory === "pasta-pizza" ? "active" : ""}`}
              onClick={() => handleCategoryClick("pasta-pizza")}
              data-category-id="pasta-pizza"
            >
              Pasta/Pizza
            </button>
            
            {/* Drinks Categories */}
            <button
              className={`category-tab-horizontal ${selectedCategory === "all-drinks" ? "active" : ""}`}
              onClick={() => handleCategoryClick("all-drinks")}
              data-category-id="all-drinks"
            >
              All Drinks
            </button>
            <button
              className={`category-tab-horizontal ${selectedCategory === "coffee" ? "active" : ""}`}
              onClick={() => handleCategoryClick("coffee", "drinks")}
              data-category-id="coffee"
            >
              Coffee
            </button>
            <button
              className={`category-tab-horizontal ${selectedCategory === "floral-teas" ? "active" : ""}`}
              onClick={() => handleCategoryClick("floral-teas", "drinks")}
              data-category-id="floral-teas"
            >
              Floral Teas
            </button>
            <button
              className={`category-tab-horizontal ${selectedCategory === "chai" ? "active" : ""}`}
              onClick={() => handleCategoryClick("chai", "drinks")}
              data-category-id="chai"
            >
              Chai
            </button>
            <button
              className={`category-tab-horizontal ${selectedCategory === "juices" ? "active" : ""}`}
              onClick={() => handleCategoryClick("juices", "drinks")}
              data-category-id="juices"
            >
              Juices
            </button>
            <button
              className={`category-tab-horizontal ${selectedCategory === "mocktails" ? "active" : ""}`}
              onClick={() => handleCategoryClick("mocktails", "drinks")}
              data-category-id="mocktails"
            >
              Mocktails
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;