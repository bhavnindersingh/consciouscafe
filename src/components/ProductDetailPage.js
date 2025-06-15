import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductDetailPage = ({ products, onAddToCart }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const product = products.find(p => p.id === parseInt(productId));
  
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes?.length > 0 ? product.sizes[0].id : null
  );
  
  const [quantity, setQuantity] = useState(1);
  
  if (!product) {
    return (
      <div className="product-not-found">
        <div className="container">
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  const handleSizeChange = (sizeId) => {
    setSelectedSize(sizeId);
  };
  
  const handleAddToCart = () => {
    const selectedSizeObj = product.sizes?.find(size => size.id === selectedSize);
    
    const productToAdd = {
      ...product,
      quantity,
      selectedSize: selectedSizeObj ? selectedSizeObj.name : null,
      price: selectedSizeObj ? selectedSizeObj.price : product.price
    };
    
    onAddToCart(productToAdd);
  };
  
  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-detail-content">
          <div className="product-detail-image">
            <img src={product.image} alt={product.name} />
          </div>
          
          <div className="product-detail-info">
            <button onClick={() => navigate(-1)} className="back-btn">
              &larr; Back
            </button>
            
            <h1 className="product-name">{product.name}</h1>
            <p className="product-description">{product.description}</p>
            
            {product.category === 'birthday-cakes' && product.sizes && (
              <div className="product-sizes">
                <h3>Choose Size</h3>
                <div className="size-options">
                  {product.sizes.map(size => (
                    <button
                      key={size.id}
                      className={`size-btn ${selectedSize === size.id ? 'selected' : ''}`}
                      onClick={() => handleSizeChange(size.id)}
                    >
                      {size.name} - ₹{size.price}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {!product.sizes && (
              <div className="product-price">
                ₹{product.price}
              </div>
            )}
            
            <div className="quantity-selector">
              <button 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="quantity-btn"
              >
                -
              </button>
              <span className="quantity">{quantity}</span>
              <button 
                onClick={() => setQuantity(prev => prev + 1)}
                className="quantity-btn"
              >
                +
              </button>
            </div>
            
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
