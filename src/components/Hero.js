import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const [videoError, setVideoError] = useState(false);

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

  const handleCategoryClick = (categoryId, type = "food") => {
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
          <div className="category-tabs-horizontal">
            {/* Food Categories */}
            <button
              className="category-tab-horizontal active"
              onClick={() => handleCategoryClick("all")}
            >
              All Items
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => handleCategoryClick("toast")}
            >
              Toast
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => handleCategoryClick("all-day-breakfast")}
            >
              All Day Breakfast
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => handleCategoryClick("smoothie-bowls")}
            >
              Smoothie Bowls
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => handleCategoryClick("earth-grills-crisps")}
            >
              Earth Grills/Crisps
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => handleCategoryClick("salads")}
            >
              Salads
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => handleCategoryClick("platters")}
            >
              Platters
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => handleCategoryClick("earth-bowls")}
            >
              Earth Bowls
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => handleCategoryClick("noodle-bowls")}
            >
              Noodle Bowls
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => handleCategoryClick("pasta-pizza")}
            >
              Pasta/Pizza
            </button>
            
            {/* Drinks Categories */}
            <button
              className="category-tab-horizontal"
              onClick={() => handleCategoryClick("all-drinks")}
            >
              All Drinks
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => handleCategoryClick("coffee", "drinks")}
            >
              Coffee
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => handleCategoryClick("tea", "drinks")}
            >
              Tea
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => handleCategoryClick("smoothies", "drinks")}
            >
              Smoothies
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => handleCategoryClick("juices", "drinks")}
            >
              Juices
            </button>
            <button
              className="category-tab-horizontal"
              onClick={() => handleCategoryClick("beverages", "drinks")}
            >
              Beverages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;