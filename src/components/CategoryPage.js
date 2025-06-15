import React from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from './ProductCard';

const CategoryPage = ({ category: propCategory, products, onAddToCart, onProductClick }) => {
  // Use the category from URL params if not provided as prop
  const { categoryId } = useParams();
  const category = propCategory || categoryId;
  const categoryData = {
    'toast': {
      title: 'Toast',
      subtitle: 'Delicious toasts for every taste',
      description: 'Enjoy a variety of toasts with different toppings and spreads.',
      heroImage: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1200&h=400&fit=crop',
      bgColor: 'linear-gradient(135deg, #FFE4E6 0%, #FFF0F5 100%)',
      icon: '🍞'
    },
    'all-day-breakfast': {
      title: 'All Day Breakfast',
      subtitle: 'Breakfast favorites served all day',
      description: 'Start your day right with our all-day breakfast options.',
      heroImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=400&fit=crop',
      bgColor: 'linear-gradient(135deg, #F0E6FF 0%, #FAF0FF 100%)',
      icon: '🍳'
    },
    'smoothie-bowls': {
      title: 'Smoothie Bowls',
      subtitle: 'Healthy and refreshing smoothie bowls',
      description: 'Packed with nutrients and flavor, our smoothie bowls are a perfect meal.',
      heroImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=400&fit=crop',
      bgColor: 'linear-gradient(135deg, #FFF4E6 0%, #FFFAF0 100%)',
      icon: '🥣'
    },
    'earth-grills-crisps': {
      title: 'Earth Grills/Crisps',
      subtitle: 'Grilled and crispy delights',
      description: 'Savor the taste of our grilled and crispy offerings.',
      heroImage: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=1200&h=400&fit=crop',
      bgColor: 'linear-gradient(135deg, #F5F0E6 0%, #FAF7F0 100%)',
      icon: '🌽'
    },
    'salads': {
      title: 'Salads',
      subtitle: 'Fresh and healthy salads',
      description: 'Our salads are made with the freshest ingredients.',
      heroImage: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1200&h=400&fit=crop',
      bgColor: 'linear-gradient(135deg, #E6FFF0 0%, #F0FAF5 100%)',
      icon: '🥗'
    },
    'platters': {
      title: 'Platters',
      subtitle: 'Perfect for sharing',
      description: 'Our platters are perfect for sharing with friends and family.',
      heroImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=400&fit=crop',
      bgColor: 'linear-gradient(135deg, #E6F0FF 0%, #F0F5FA 100%)',
      icon: '🍽️'
    },
    'earth-bowls': {
      title: 'Earth Bowls',
      subtitle: 'Wholesome and nutritious bowls',
      description: 'Enjoy our earth bowls packed with nutrients.',
      heroImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=400&fit=crop',
      bgColor: 'linear-gradient(135deg, #FFF0E6 0%, #FFF5F0 100%)',
      icon: '🥙'
    },
    'noodle-bowls': {
      title: 'Noodle Bowls',
      subtitle: 'Flavorful noodle bowls',
      description: 'Our noodle bowls are a perfect blend of taste and nutrition.',
      heroImage: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=1200&h=400&fit=crop',
      bgColor: 'linear-gradient(135deg, #F0F5E6 0%, #F5FAF0 100%)',
      icon: '🍜'
    },
    'pasta-pizza': {
      title: 'Pasta/Pizza',
      subtitle: 'Italian favorites',
      description: 'Indulge in our delicious pasta and pizza offerings.',
      heroImage: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1200&h=400&fit=crop',
      bgColor: 'linear-gradient(135deg, #FFE6E6 0%, #FFF0F0 100%)',
      icon: '🍕'
    },
    'desserts': {
      title: 'Desserts',
      subtitle: 'Sweet treats to end your meal',
      description: 'Our desserts are the perfect way to end your meal.',
      heroImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=400&fit=crop',
      bgColor: 'linear-gradient(135deg, #F0E6F0 0%, #FAF0FA 100%)',
      icon: '🍰'
    }
  };

  const currentCategory = categoryData[category];
  const filteredProducts = products.filter(product => product.category === category);

  if (!currentCategory) {
    return null;
  }

  return (
    <div className="category-page">
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
              <img src={currentCategory.heroImage} alt={currentCategory.title} />
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="category-products">
        <div className="container">
          <div className="category-products-header">
            <h2>Our {currentCategory.title}</h2>
            <p>Handcrafted with love and the finest ingredients</p>
          </div>
          
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
