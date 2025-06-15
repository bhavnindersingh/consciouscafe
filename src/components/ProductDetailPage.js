import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductDetailPage = ({ products, onAddToCart }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  // Convert productId to number safely
  const numericProductId = parseInt(productId, 10);
  
  // Find the product with proper error handling
  const product = Array.isArray(products) ? 
    products.find(p => p.id === numericProductId) : null;
  
  // Initialize state after product is found
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  // Update selectedSize when product changes
  useEffect(() => {
    if (product?.sizes?.length > 0) {
      setSelectedSize(product.sizes[0].id);
    }
  }, [product]);
  
  if (!product) {
    return (
      <div className="product-not-found">
        <div className="container">
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist or is currently unavailable.</p>
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
  
  // Format price with proper currency symbol
  const formatPrice = (price) => {
    return `₹${price}`;
  };

  // Mock nutritional data (would come from the product data in a real app)
  const nutritionalInfo = {
    calories: Math.floor(Math.random() * 300) + 200, // Random value between 200-500
    protein: Math.floor(Math.random() * 15) + 5, // Random value between 5-20g
    carbs: Math.floor(Math.random() * 30) + 20, // Random value between 20-50g
    fats: Math.floor(Math.random() * 15) + 5, // Random value between 5-20g
    fiber: Math.floor(Math.random() * 5) + 1, // Random value between 1-6g
  };

  // Mock ingredients (would come from the product data in a real app)
  const ingredients = [
    "Organic Flour", 
    "Free-range Eggs", 
    "Organic Sugar", 
    "Himalayan Salt", 
    "Natural Flavors", 
    "Organic Milk"
  ];
  
  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-detail-card">
          <div className="product-detail-header">
            <button onClick={() => navigate(-1)} className="back-btn">
              &larr; Back
            </button>
            
            {product.bestseller && (
              <span className="bestseller-badge-detail">Bestseller</span>
            )}
          </div>
          
          <div className="product-detail-content">
            <div className="product-detail-image">
              <img src={product.image} alt={product.name} />
            </div>
            
            <div className="product-detail-info">
              <h1 className="product-detail-title">{product.name}</h1>
              
              <div className="product-meta">
                <div className="product-category-tag">
                  {product.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                
                {product.bestseller && (
                  <div className="product-bestseller-tag">
                    Popular Choice
                  </div>
                )}
              </div>
              
              <div className="product-price-detail">
                {formatPrice(product.price)}
              </div>
              
              <div className="product-detail-tabs">
                <button 
                  className={`detail-tab ${activeTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button 
                  className={`detail-tab ${activeTab === 'nutrition' ? 'active' : ''}`}
                  onClick={() => setActiveTab('nutrition')}
                >
                  Nutrition
                </button>
                <button 
                  className={`detail-tab ${activeTab === 'ingredients' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ingredients')}
                >
                  Ingredients
                </button>
              </div>
              
              <div className="product-detail-tab-content">
                {activeTab === 'description' && (
                  <div className="description-content">
                    <p className="product-detail-description">{product.description}</p>
                    <p>Our {product.name} is made with the finest ingredients, carefully selected to ensure the best taste and quality. Perfect for any occasion, this dish will satisfy your cravings and leave you wanting more.</p>
                  </div>
                )}
                
                {activeTab === 'nutrition' && (
                  <div className="nutrition-content">
                    <div className="nutrition-grid">
                      <div className="nutrition-item">
                        <div className="nutrition-value">{nutritionalInfo.calories}</div>
                        <div className="nutrition-label">Calories</div>
                      </div>
                      <div className="nutrition-item">
                        <div className="nutrition-value">{nutritionalInfo.protein}g</div>
                        <div className="nutrition-label">Protein</div>
                      </div>
                      <div className="nutrition-item">
                        <div className="nutrition-value">{nutritionalInfo.carbs}g</div>
                        <div className="nutrition-label">Carbs</div>
                      </div>
                      <div className="nutrition-item">
                        <div className="nutrition-value">{nutritionalInfo.fats}g</div>
                        <div className="nutrition-label">Fats</div>
                      </div>
                      <div className="nutrition-item">
                        <div className="nutrition-value">{nutritionalInfo.fiber}g</div>
                        <div className="nutrition-label">Fiber</div>
                      </div>
                    </div>
                    
                    <div className="nutrition-note">
                      <p>Values are approximate and based on standard serving size.</p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'ingredients' && (
                  <div className="ingredients-content">
                    <ul className="ingredients-list">
                      {ingredients.map((ingredient, index) => (
                        <li key={index} className="ingredient-item">{ingredient}</li>
                      ))}
                    </ul>
                    <p className="ingredients-note">All our ingredients are sourced from local farmers and suppliers whenever possible.</p>
                  </div>
                )}
              </div>
              
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
                        {size.name} - {formatPrice(size.price)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="product-actions">
                <div className="quantity-selector">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="quantity-btn"
                    disabled={quantity <= 1}
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
                  className="add-to-cart-btn-detail"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
