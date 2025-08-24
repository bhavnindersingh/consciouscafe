import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from './SEO';
import { generateStructuredData } from '../utils/seoData';

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
  const [selectedOption, setSelectedOption] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  // Update selectedSize and selectedOption when product changes
  useEffect(() => {
    if (product?.sizes?.length > 0) {
      setSelectedSize(product.sizes[0].id);
    }
    if (product?.options?.length > 0) {
      setSelectedOption(product.options[0]);
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

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };
  
  const handleAddToCart = () => {
    const selectedSizeObj = product.sizes?.find(size => size.id === selectedSize);
    
    // Determine the final price based on selected size or option
    let finalPrice = product.price;
    if (selectedSizeObj) {
      finalPrice = selectedSizeObj.price;
    } else if (selectedOption) {
      finalPrice = selectedOption.price;
    }
    
    const productToAdd = {
      ...product,
      quantity,
      selectedSize: selectedSizeObj ? selectedSizeObj.name : null,
      selectedOption: selectedOption ? selectedOption.name : null,
      price: finalPrice
    };
    
    onAddToCart(productToAdd);
  };
  
  // Format price with proper currency symbol
  const formatPrice = (price) => {
    return `₹${price}`;
  };

  // Get nutritional data from product data
  const nutritionalInfo = product.nutrition || {};
  
  // Generate SEO data for product page
  const seoData = product ? {
    title: product.name,
    description: product.description || `${product.name} from Conscious Cafe.`,
    keywords: `${product.name}, conscious cafe, ${product.category}, healthy eating`,
    url: `/product/${product.id}`,
    image: product.image,
    structuredData: [
      generateStructuredData('menuItem', {
        name: product.name,
        description: product.description || `${product.name} from Conscious Cafe`,
        image: product.image,
        price: product.price,
        nutrition: nutritionalInfo,
      }),
      generateStructuredData('breadcrumb', {
        items: [
          { name: 'Home', url: '/' },
          { name: 'Menu', url: '/menu' },
          { name: product.name, url: `/product/${product.id}` },
        ]
      })
    ]
  } : null;
  
  return (
    <div className="product-detail-page">
      {seoData && (
        <SEO
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords}
          url={seoData.url}
          image={seoData.image}
          structuredData={seoData.structuredData}
        />
      )}
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
              {product.imageType === 'sirv' ? (
                <img className="Sirv" data-src={product.sirvDataSrc || product.image} alt={product.name} />
              ) : (
                <img src={product.image} alt={product.name} />
              )}
            </div>
            
            <div className="product-detail-info">
              <h1 className="product-detail-title">{product.name}</h1>
              
              <div className="product-meta">
                <div className="product-category-tag">
                  {product.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                

              </div>
              
              <div className="product-price-detail">
                {selectedOption ? formatPrice(selectedOption.price) : formatPrice(product.price)}
                {selectedOption && (
                  <span className="option-info"> ({selectedOption.name})</span>
                )}
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
              </div>
              
              <div className="product-detail-tab-content">
                {activeTab === 'description' && (
                  <div className="description-content">
                    <p className="product-detail-description">{product.description}</p>
                  </div>
                )}
                
                {activeTab === 'nutrition' && (
                  <div className="nutrition-content">
                    {Object.keys(nutritionalInfo).length > 0 ? (
                      <>
                        <div className="nutrition-grid">
                          {nutritionalInfo.calories && (
                            <div className="nutrition-item">
                              <div className="nutrition-value">{nutritionalInfo.calories}</div>
                              <div className="nutrition-label">Calories</div>
                            </div>
                          )}
                          {nutritionalInfo.protein && (
                            <div className="nutrition-item">
                              <div className="nutrition-value">{nutritionalInfo.protein}g</div>
                              <div className="nutrition-label">Protein</div>
                            </div>
                          )}
                          {nutritionalInfo.carbs && (
                            <div className="nutrition-item">
                              <div className="nutrition-value">{nutritionalInfo.carbs}g</div>
                              <div className="nutrition-label">Carbs</div>
                            </div>
                          )}
                          {nutritionalInfo.fats && (
                            <div className="nutrition-item">
                              <div className="nutrition-value">{nutritionalInfo.fats}g</div>
                              <div className="nutrition-label">Fats</div>
                            </div>
                          )}
                          {nutritionalInfo.fiber && (
                            <div className="nutrition-item">
                              <div className="nutrition-value">{nutritionalInfo.fiber}g</div>
                              <div className="nutrition-label">Fiber</div>
                            </div>
                          )}
                        </div>
                        <div className="nutrition-note">
                          <p>Values are approximate and based on standard serving size.</p>
                        </div>
                      </>
                    ) : (
                      <p>Nutrition information not available for this product.</p>
                    )}
                  </div>
                )}
                

              </div>
              
              {/* Options Selection for products with options (like Avocado Toast) */}
              {product.options && product.options.length > 0 && (
                <div className="product-options">
                  <h3>Choose Option</h3>
                  <div className="option-buttons">
                    {product.options.map(option => (
                      <button
                        key={option.name}
                        className={`option-btn ${selectedOption?.name === option.name ? 'selected' : ''}`}
                        onClick={() => handleOptionChange(option)}
                      >
                        {option.name} - {formatPrice(option.price)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection for birthday cakes */}
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
