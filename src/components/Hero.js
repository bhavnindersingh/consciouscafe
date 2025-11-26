import React, { useEffect, useState, useRef, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const scrollContainerRef = useRef(null);


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

    startTransition(() => {
      if (categoryId === "all") {
        navigate("/menu");
      } else if (categoryId === "all-drinks") {
        navigate("/drinks");
      } else if (type === "drinks") {
        navigate(`/drinks/category/${categoryId}`);
      } else {
        navigate(`/category/${categoryId}`);
      }
    });
  };


  // Defer sticky navigation to reduce main thread blocking
  useEffect(() => {
    const timer = setTimeout(() => {
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
    }, 300); // Defer by 300ms

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-video-backdrop">
          <div style={{ position: 'relative' }}>
            <iframe
              title="Gumlet video player"
              src="https://play.gumlet.io/embed/6925f88a3c99376d4fd48188?background=true&autoplay=true&loop=true&muted=true&preload=true"
              style={{
                border: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%'
              }}
              referrerPolicy="origin"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
            />
          </div>
        </div>
        <div className="hero-content">
          <h1>Conscious Cafe</h1>
          <div className="hero-buttons">
            <button className="cta-btn" onClick={() => startTransition(() => navigate('/menu'))}>
              View Menu
            </button>
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
              Pasta
            </button>
            <button
              className={`category-tab-horizontal ${selectedCategory === "desserts" ? "active" : ""}`}
              onClick={() => handleCategoryClick("desserts")}
              data-category-id="desserts"
            >
              Desserts
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;