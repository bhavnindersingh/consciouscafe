import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart, onProductClick }) => {
  const navigate = useNavigate();
  
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
    // For birthday cakes, open product page to select size
    if (product.category === 'birthday-cakes') {
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
        <img src={product.image} alt={product.name} />
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
          {product.category === 'birthday-cakes' ? 'Choose Size' : 'Add To Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
