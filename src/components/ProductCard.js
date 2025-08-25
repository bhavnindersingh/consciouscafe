import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart, onProductClick }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.Sirv) {
      window.Sirv.start();
    }
  }, []);
  
  const handleCardClick = (e) => {
    // Don't open product page if clicking the add to cart button
    if (e.target.closest('.add-to-cart-btn')) {
      return;
    }
    
    // Use the provided onProductClick function which now navigates to the product page
    onProductClick(product);
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    // Check if product has options (like Avocado Toast with Veg/Egg options)
    const hasOptions = Array.isArray(product.options) && product.options.length > 0;
    
    // For birthday cakes or items with options, open product page to select
    if (product.category === 'birthday-cakes' || hasOptions) {
      onProductClick(product);
    } else {
      // For other items, add directly to cart
      onAddToCart(product);
    }
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      {product.bestseller && (
        <div className="bestseller-badge">Best Seller</div>
      )}
      
      <div className="product-image">
        {product.imageType === 'sirv' ? (
          <img className="Sirv" data-src={product.sirvDataSrc || product.image} alt={product.name} />
        ) : (
          <img src={product.image} alt={product.name} />
        )}
      </div>
      
      <div className="product-info">
        <div className="product-category-subtle">
          {product.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price">
          ₹{product.price}
          {product.category === 'birthday-cakes' && <span className="from-price">from</span>}
        </div>
        
        <button 
          className="add-to-cart-btn"
          onClick={handleQuickAdd}
        >
          {(() => {
            const hasOptions = Array.isArray(product.options) && product.options.length > 0;
            if (product.category === 'birthday-cakes') {
              return 'Choose Size';
            } else if (hasOptions) {
              return 'Choose Option';
            } else {
              return 'Add To Cart';
            }
          })()}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;