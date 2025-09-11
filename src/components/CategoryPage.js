import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCard from './ProductCard';

const CategoryPage = ({ category: propCategory, products, onAddToCart, onProductClick }) => {
  // Use the category from URL params if not provided as prop
  const { categoryId } = useParams();
  const category = propCategory || categoryId;

  // Initialize Sirv for hero image
  useEffect(() => {
    if (window.Sirv) {
      window.Sirv.start();
    }
  }, []);

  // Reinitialize Sirv when category changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.Sirv) {
        window.Sirv.start();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [category]);

  // Food categories only for navigation
  const allCategories = [
    { id: "all", name: "All Items", type: "food" },
    { id: "toast", name: "Toast", type: "food" },
    { id: "all-day-breakfast", name: "All Day Breakfast", type: "food" },
    { id: "smoothie-bowls", name: "Smoothie Bowls", type: "food" },
    { id: "earth-grills-crisps", name: "Earth Grills/Crisps", type: "food" },
    { id: "salads", name: "Salads", type: "food" },
    { id: "platters", name: "Platters", type: "food" },
    { id: "earth-bowls", name: "Earth Bowls", type: "food" },
    { id: "noodle-bowls", name: "Noodle Bowls", type: "food" },
    { id: "pasta-pizza", name: "Pasta", type: "food" },
    { id: "desserts", name: "Desserts", type: "food" }
  ];

  // JavaScript sticky navigation - Hero visibility based
  useEffect(() => {
    let ticking = false;
    
    const calculateStickyTrigger = () => {
      const heroElement = document.querySelector('.category-hero');
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

  // Auto-scroll navigation bar to show active category in center
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

    // Trigger auto-scroll when component mounts and category changes
    scrollNavigationToActive();
  }, [category]);

  const handleCategoryClick = (categoryId) => {
    if (categoryId === "all") {
      window.location.href = "/menu";
    } else {
      window.location.href = `/category/${categoryId}`;
    }
  };
  const categoryData = {
    'toast': {
      title: 'Toast',
      subtitle: 'Delicious toasts for every taste',
      description: 'Enjoy a variety of toasts with different toppings and spreads.',
      heroImage: 'https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August\'25/TOASTS/pesto%20cream%20cheese/pestocreamcheese.webp.JPG',
      bgColor: 'linear-gradient(135deg, #FFE4E6 0%, #FFF0F5 100%)',
      icon: '🍞',
      seo: {
        title: 'Fresh Toast Menu - Conscious Cafe | Artisanal Toasts',
        description: 'Discover our artisanal toast collection with various toppings and spreads. Fresh, delicious toasts made daily at Conscious Cafe.',
        keywords: 'toast menu, artisanal toast, breakfast toast, conscious cafe toast'
      }
    },
    'all-day-breakfast': {
      title: 'All Day Breakfast',
      subtitle: 'Breakfast favorites served all day',
      description: 'Start your day right with our all-day breakfast options.',
      heroImage: 'https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August\'25/ALL%20DAY%20BREAKFAST/Pancakes/Pancake.JPG',
      bgColor: 'linear-gradient(135deg, #F0E6FF 0%, #FAF0FF 100%)',
      icon: '🍳',
      seo: {
        title: 'All Day Breakfast Menu - Conscious Cafe | Breakfast Anytime',
        description: 'Enjoy breakfast favorites served all day at Conscious Cafe. Fresh eggs, healthy options, and delicious breakfast dishes available anytime.',
        keywords: 'all day breakfast, breakfast menu, conscious cafe breakfast, healthy breakfast'
      }
    },
    'smoothie-bowls': {
      title: 'Smoothie Bowls',
      subtitle: 'Healthy and refreshing smoothie bowls',
      description: 'Packed with nutrients and flavor, our smoothie bowls are a perfect meal.',
      heroImage: 'https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August\'25/SMOOTHIE%20BOWLS/Goodness%20bowl/Goodness%20Bowl.JPG',
      bgColor: 'linear-gradient(135deg, #FFF4E6 0%, #FFFAF0 100%)',
      icon: '🥣'
    },
    'earth-grills-crisps': {
      title: 'Earth Grills/Crisps',
      subtitle: 'Grilled and crispy delights',
      description: 'Savor the taste of our grilled and crispy offerings.',
      heroImage: 'https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August\'25/EARTH%20GRILS/Grilled%20sweet%20potato/Grilled%20Sweet%20Potato.JPG',
      bgColor: 'linear-gradient(135deg, #F5F0E6 0%, #FAF7F0 100%)',
      icon: '🌽'
    },
    'salads': {
      title: 'Salads',
      subtitle: 'Fresh and healthy salads',
      description: 'Our salads are made with the freshest ingredients.',
      heroImage: 'https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August\'25/SALADS/Tropical%20salad/Tropical%20Salad.JPG',
      bgColor: 'linear-gradient(135deg, #E6FFF0 0%, #F0FAF5 100%)',
      icon: '🥗'
    },
    'platters': {
      title: 'Platters',
      subtitle: 'Perfect for sharing',
      description: 'Our platters are perfect for sharing with friends and family.',
      heroImage: 'https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August\'25/PLATTERS/Mezze%20platter/Mezze%20Platter.JPG',
      bgColor: 'linear-gradient(135deg, #E6F0FF 0%, #F0F5FA 100%)',
      icon: '🍽️'
    },
    'earth-bowls': {
      title: 'Earth Bowls',
      subtitle: 'Wholesome and nutritious bowls',
      description: 'Enjoy our earth bowls packed with nutrients.',
      heroImage: 'https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August\'25/EARTH%20BOWLS/Thai%20Bowl.JPG',
      bgColor: 'linear-gradient(135deg, #FFF0E6 0%, #FFF5F0 100%)',
      icon: '🥙'
    },
    'noodle-bowls': {
      title: 'Noodle Bowls',
      subtitle: 'Flavorful noodle bowls',
      description: 'Our noodle bowls are a perfect blend of taste and nutrition.',
      heroImage: 'https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August\'25/NOODLE%20BOWLS/Laksa.JPG',
      bgColor: 'linear-gradient(135deg, #F0F5E6 0%, #F5FAF0 100%)',
      icon: '🍜'
    },
    'pasta-pizza': {
      title: 'Pasta',
      subtitle: 'Italian favorites',
      description: 'Indulge in our delicious pasta offerings.',
      heroImage: 'https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August\'25/PASTAS/Meatless%20Meatballs%20(M%26M).JPG',
      bgColor: 'linear-gradient(135deg, #FFE6E6 0%, #FFF0F0 100%)',
      icon: '🍕'
    },
    'desserts': {
      title: 'Desserts',
      subtitle: 'Sweet treats to end your meal',
      description: 'Our desserts are the perfect way to end your meal.',
      heroImage: 'https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August\'25/DESSERTS/Chocolate%20Mousse.JPG',
      bgColor: 'linear-gradient(135deg, #F0E6F0 0%, #FAF0FA 100%)',
      icon: '🍰'
    },
    'juices': {
      title: 'Juices',
      subtitle: 'Fresh and healthy juice blends',
      description: 'Fresh fruit and vegetable juices.',
      heroImage: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=1200&h=400&fit=crop',
      bgColor: 'linear-gradient(135deg, #E6FFE6 0%, #F0FFF0 100%)',
      icon: '🧃'
    },
    'mocktails': {
      title: 'Mocktails',
      subtitle: 'Refreshing non-alcoholic cocktails',
      description: 'Creative and refreshing mocktails.',
      heroImage: 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=1200&h=400&fit=crop',
      bgColor: 'linear-gradient(135deg, #FFE6F0 0%, #FFF0F8 100%)',
      icon: '🍹'
    },
    'floral-teas': {
      title: 'Floral Teas',
      subtitle: 'Aromatic and calming tea blends',
      description: 'Delicate floral tea blends for relaxation and wellness.',
      heroImage: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200&h=400&fit=crop',
      bgColor: 'linear-gradient(135deg, #F0E6FF 0%, #F8F0FF 100%)',
      icon: '🌸'
    },
    'chai': {
      title: 'Chai',
      subtitle: 'Traditional spiced tea',
      description: 'Authentic Indian chai blends with aromatic spices.',
      heroImage: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=1200&h=400&fit=crop',
      bgColor: 'linear-gradient(135deg, #FFF0E6 0%, #FFF8F0 100%)',
      icon: '☕'
    },
    'coffee': {
      title: 'Coffee',
      subtitle: 'Premium coffee selections',
      description: 'Coffee drinks from espresso to specialty lattes.',
      heroImage: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1200&h=400&fit=crop',
      bgColor: 'linear-gradient(135deg, #E6E0D4 0%, #F0EDE6 100%)',
      icon: '☕',
      seo: {
        title: 'Premium Coffee Menu - Conscious Cafe | Espresso & Specialty Lattes',
        description: 'Discover our premium coffee selection including espresso, cappuccino, lattes, and specialty coffee drinks at Conscious Cafe.',
        keywords: 'coffee menu, espresso, cappuccino, latte, specialty coffee, conscious cafe coffee'
      }
    }
  };

  const currentCategory = categoryData[category];
  const filteredProducts = products.filter(product => product.category === category);

  if (!currentCategory) {
    return (
      <div className="category-page">
        <div className="container" style={{padding: '100px 20px', textAlign: 'center'}}>
          <h2>Category "{category}" not found</h2>
          <p>Available categories: {Object.keys(categoryData).join(', ')}</p>
          <p>Products count: {products.length}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <Helmet>
        <title>{currentCategory.seo?.title || `${currentCategory.title} - Conscious Cafe`}</title>
        <meta name="description" content={currentCategory.seo?.description || currentCategory.description} />
        {currentCategory.seo?.keywords && (
          <meta name="keywords" content={currentCategory.seo.keywords} />
        )}
        <meta property="og:title" content={currentCategory.seo?.title || `${currentCategory.title} - Conscious Cafe`} />
        <meta property="og:description" content={currentCategory.seo?.description || currentCategory.description} />
        <meta property="og:image" content={currentCategory.heroImage} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://consciousbakes.com/category/${category}`} />
      </Helmet>

      {/* Hero Banner */}
      <div 
        className="category-hero"
        style={{ background: currentCategory.bgColor }}
      >
        <div className="container">
          <div className="category-hero-content">
            <div className="category-hero-text">
              <h1>{currentCategory.title}</h1>
              <p className="category-subtitle">{currentCategory.subtitle}</p>
              <p className="category-description">{currentCategory.description}</p>
              <div className="category-stats">
                <span className="product-count">{filteredProducts.length} Products Available</span>
                <span className="fresh-badge">🌸 Freshly Made Daily</span>
              </div>
            </div>
            <div className="category-hero-image">
              {currentCategory.heroImage.includes('sirv.com') ? (
                <img className="Sirv" data-src={currentCategory.heroImage} alt={currentCategory.title} />
              ) : (
                <img src={currentCategory.heroImage} alt={currentCategory.title} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="category-navigation static">
        <div className="container">
          <div className="category-tabs-horizontal">
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                className={`category-tab-horizontal ${category === cat.id ? "active" : ""}`}
                onClick={() => handleCategoryClick(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="category-products">
        <div className="container">
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onProductClick={onProductClick}
                />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>No products available in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
