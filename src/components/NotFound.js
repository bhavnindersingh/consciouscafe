import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <SEO
        title="Page Not Found (404)"
        description="The page you're looking for doesn't exist. Explore our artisanal vegan menu at Conscious Cafe Auroville or return to our homepage."
        keywords="404 error, page not found, conscious cafe, vegan restaurant auroville"
        noIndex={true}
      />
      
      <div className="not-found-hero">
        <div className="container">
          <div className="not-found-content">
            <h1>Page Not Found</h1>
            <div className="error-code">404</div>
            <p>Oops! The page you're looking for seems to have wandered off like a mindful soul in meditation.</p>
          </div>
        </div>
      </div>

      <section className="not-found-suggestions">
        <div className="container">
          <h2>Let's Find What You're Looking For</h2>
          
          <div className="suggestions-grid">
            <div className="suggestion-card">
              <h3>🍽️ Explore Our Menu</h3>
              <p>Discover our artisanal vegan and vegetarian dishes made with conscious ingredients.</p>
              <Link to="/menu" className="cta-btn">
                View Food Menu
              </Link>
            </div>
            
            <div className="suggestion-card">
              <h3>🏠 Return Home</h3>
              <p>Go back to our homepage and start your conscious dining journey from the beginning.</p>
              <Link to="/" className="cta-btn">
                Go to Homepage
              </Link>
            </div>
            
            <div className="suggestion-card">
              <h3>📍 Visit Us</h3>
              <p>Find our location at Kavas Yoga Retreat in Auroville and plan your visit.</p>
              <Link to="/contact" className="cta-btn">
                Contact & Location
              </Link>
            </div>
            
            <div className="suggestion-card">
              <h3>🚚 Delivery Info</h3>
              <p>Learn about our food delivery options and areas we serve in Auroville.</p>
              <Link to="/delivery" className="cta-btn">
                Delivery Information
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="not-found-popular">
        <div className="container">
          <h2>Popular Menu Items</h2>
          <p>While you're here, check out some of our most loved dishes:</p>
          
          <div className="popular-links">
            <div className="popular-categories">
              <h3>Popular Categories</h3>
              <ul>
                <li><Link to="/category/toast">Artisanal Toasts</Link></li>
                <li><Link to="/category/smoothie-bowls">Smoothie Bowls</Link></li>
                <li><Link to="/category/earth-bowls">Earth Bowls</Link></li>
                <li><Link to="/category/salads">Fresh Salads</Link></li>
                <li><Link to="/category/desserts">Conscious Desserts</Link></li>
              </ul>
            </div>
            
            <div className="help-section">
              <h3>Need Help?</h3>
              <p>If you think this page should exist or you're experiencing technical issues, please let us know!</p>
              <div className="help-links">
                <Link to="/about" className="help-link">About Conscious Cafe</Link>
                <Link to="/contact" className="help-link">Contact Us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFound;