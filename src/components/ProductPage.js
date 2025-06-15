import React, { useState } from 'react';

const ProductPage = ({ product, isOpen, onClose, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedPrice, setSelectedPrice] = useState(product?.price || 0);

  // Define size options for cakes
  const cakeSizes = {
    'Small (6")': { multiplier: 1, serves: '4-6 people' },
    'Medium (8")': { multiplier: 1.5, serves: '8-10 people' },
    'Large (10")': { multiplier: 2.2, serves: '12-15 people' },
    'Extra Large (12")': { multiplier: 3, serves: '18-20 people' }
  };

  const isCake = product?.category === 'birthday-cakes';

  React.useEffect(() => {
    if (product && isCake && !selectedSize) {
      const firstSize = Object.keys(cakeSizes)[0];
      setSelectedSize(firstSize);
      setSelectedPrice(product.price * cakeSizes[firstSize].multiplier);
    } else if (product && !isCake) {
      setSelectedPrice(product.price);
    }
  }, [product, isCake]);

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setSelectedPrice(product.price * cakeSizes[size].multiplier);
  };

  const handleAddToCart = () => {
    const productToAdd = {
      ...product,
      price: selectedPrice,
      quantity: quantity,
      selectedSize: isCake ? selectedSize : null,
      id: isCake ? `${product.id}-${selectedSize}` : product.id
    };

    onAddToCart(productToAdd);
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="product-page-overlay">
      <div className="product-page-modal">
        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="product-page-content">
          {/* Product Images */}
          <div className="product-page-images">
            <div className="main-image">
              <img src={product.image} alt={product.name} />
              {product.bestseller && (
                <div className="bestseller-badge">Best Seller</div>
              )}
            </div>
            
            {/* Thumbnail images - you can add more images here */}
            <div className="thumbnail-images">
              <div className="thumbnail active">
                <img src={product.image} alt={product.name} />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="product-page-details">
            <div className="product-page-header">
              <h1>{product.name}</h1>
              <div className="product-page-price">
                ₹{selectedPrice}
                {isCake && selectedSize && (
                  <span className="size-info">({selectedSize})</span>
                )}
              </div>
            </div>

            <div className="product-page-description">
              <p>{product.description}</p>
              {isCake && selectedSize && (
                <p className="serves-info">
                  <i className="fas fa-users"></i>
                  Serves {cakeSizes[selectedSize].serves}
                </p>
              )}
            </div>

            {/* Size Selection for Cakes */}
            {isCake && (
              <div className="size-selection">
                <h3>Choose Size</h3>
                <div className="size-options">
                  {Object.entries(cakeSizes).map(([size, info]) => (
                    <div
                      key={size}
                      className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => handleSizeChange(size)}
                    >
                      <div className="size-name">{size}</div>
                      <div className="size-price">₹{Math.round(product.price * info.multiplier)}</div>
                      <div className="size-serves">{info.serves}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="quantity-selection">
              <h3>Quantity</h3>
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span className="quantity-display">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="total-price">
              <div className="total-label">Total:</div>
              <div className="total-amount">₹{selectedPrice * quantity}</div>
            </div>

            {/* Add to Cart Button */}
            <button 
              className="add-to-cart-btn-large"
              onClick={handleAddToCart}
              disabled={isCake && !selectedSize}
            >
              <i className="fas fa-shopping-cart"></i>
              Add to Cart
            </button>

            {/* Product Features */}
            <div className="product-features">
              <div className="feature">
                <i className="fas fa-leaf"></i>
                <span>Made with organic ingredients</span>
              </div>
              <div className="feature">
                <i className="fas fa-clock"></i>
                <span>Fresh baked daily</span>
              </div>
              <div className="feature">
                <i className="fas fa-truck"></i>
                <span>Same day delivery available</span>
              </div>
              <div className="feature">
                <i className="fas fa-heart"></i>
                <span>Made with love</span>
              </div>
            </div>

            {/* Ingredients */}
            <div className="product-ingredients">
              <h3>Ingredients</h3>
              <p>Premium flour, organic eggs, real butter, pure vanilla extract, and the finest ingredients sourced locally when possible.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
