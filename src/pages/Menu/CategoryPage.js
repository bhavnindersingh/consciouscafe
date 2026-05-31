import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../../components/products/ProductCard/ProductCard';

// Rotating pastel gradients for dynamic categories
const CATEGORY_GRADIENTS = [
  'linear-gradient(135deg, #FFE4E6 0%, #FFF0F5 100%)',
  'linear-gradient(135deg, #E6FFF0 0%, #F0FAF5 100%)',
  'linear-gradient(135deg, #FFF4E6 0%, #FFFAF0 100%)',
  'linear-gradient(135deg, #E6F0FF 0%, #F0F5FA 100%)',
  'linear-gradient(135deg, #F0E6FF 0%, #FAF0FF 100%)',
  'linear-gradient(135deg, #E6FFE6 0%, #F0FFF0 100%)',
  'linear-gradient(135deg, #FFF0E6 0%, #FFF5F0 100%)',
  'linear-gradient(135deg, #E6E0D4 0%, #F0EDE6 100%)',
];

const slugToTitle = (slug) =>
  (slug || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

const CategoryPage = ({ categories = [], mainCategories = [], categoryGroups = {}, products, onAddToCart, onProductClick }) => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  // Resolve the parent main category regardless of whether we're on a main or sub-category URL
  const currentMainId = mainCategories.some((c) => c.id === categoryId)
    ? categoryId
    : products.find((p) => p.category === categoryId)?.mainCategory;

  // Always show the sibling sub-categories of the parent group
  const subNavItems = (currentMainId && categoryGroups[currentMainId]) || [];

  // Sticky nav effect
  useEffect(() => {
    let ticking = false;
    const calculateTrigger = () => {
      const hero = document.querySelector('.category-hero');
      if (!hero) return 150;
      const isMobile = window.innerWidth <= 768;
      return hero.offsetTop + hero.offsetHeight * (isMobile ? 0.6 : 0.75);
    };
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const nav = document.querySelector('.category-navigation');
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          if (nav) {
            nav.classList.toggle('sticky', scrollTop > calculateTrigger());
            nav.classList.toggle('static', scrollTop <= calculateTrigger());
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Auto-scroll active tab into view
  useEffect(() => {
    const nav = document.querySelector('.category-tabs-horizontal');
    const active = document.querySelector('.category-tab-horizontal.active');
    if (nav && active) {
      const scrollLeft = active.offsetLeft - nav.getBoundingClientRect().width / 2 + active.getBoundingClientRect().width / 2;
      nav.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [categoryId]);

  const handleCategoryClick = (id) => {
    navigate(`/category/${id}`);
  };

  // Match main category (e.g. /category/food shows all food items regardless of sub-category)
  // or sub-category (e.g. /category/coffee shows only coffee items)
  const filteredProducts = products.filter(
    (p) => p.mainCategory === categoryId || p.category === categoryId
  );
  const heroImage = filteredProducts[0]?.image || null;
  const title = slugToTitle(categoryId);

  // Pick a consistent gradient for this category based on its position in the list
  const catIndex = categories.findIndex((c) => c.id === categoryId);
  const bgColor = CATEGORY_GRADIENTS[(catIndex >= 0 ? catIndex : 0) % CATEGORY_GRADIENTS.length];

  return (
    <div className="category-page">
      <Helmet>
        <title>{title} - Conscious Cafe</title>
        <meta name="description" content={`${title} at Conscious Cafe — freshly made daily.`} />
        <meta property="og:title" content={`${title} - Conscious Cafe`} />
        <meta property="og:description" content={`${title} at Conscious Cafe — freshly made daily.`} />
        {heroImage && <meta property="og:image" content={heroImage} />}
        <link rel="canonical" href={`https://consciouscafe.in/category/${categoryId}`} />
      </Helmet>

      {/* Hero Banner */}
      <div className="category-hero" style={{ background: bgColor }}>
        <div className="container">
          <div className="category-hero-content">
            <div className="category-hero-text">
              <h1>{title}</h1>
              <p className="category-subtitle">Freshly made daily</p>
              <div className="category-stats">
                <span className="product-count">{filteredProducts.length} Items Available</span>
                <span className="fresh-badge">🌸 Freshly Made Daily</span>
              </div>
            </div>
            {heroImage && (
              <div className="category-hero-image">
                <img src={heroImage} alt={title} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="category-navigation static">
        <div className="container">
          <div className="category-tabs-horizontal">
            {subNavItems.map((cat) => (
              <button
                key={cat.id}
                className={`category-tab-horizontal ${categoryId === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="category-products">
        <div className="container">
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
            <div className="no-products">
              <p>No items available in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
