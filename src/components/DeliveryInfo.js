import React from 'react';

const DeliveryInfo = () => {
  return (
    <div className="delivery-info-page">
      {/* Hero Section */}
      <div className="hero delivery-hero">
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&h=400&fit=crop&crop=center" 
            alt="Delivery Info" 
            className="hero-bg-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1>Delivery & Pickup</h1>
            <p>Fresh, conscious food delivered to your doorstep</p>
          </div>
        </div>
      </div>

      {/* Delivery Options */}
      <div className="delivery-content">
        <div className="container">
          {/* Delivery Options */}
          <section className="delivery-options">
            <h2>Delivery Options</h2>
            <div className="options-grid">
              <div className="option-card">
                <div className="option-icon">🚚</div>
                <h3>Home Delivery</h3>
                <p>Get your favorite meals delivered fresh to your home</p>
                <ul>
                  <li>Free delivery on orders over $30</li>
                  <li>Delivery fee: $4.99 for orders under $30</li>
                  <li>Estimated delivery time: 30-45 minutes</li>
                  <li>Available daily: 11:00 AM - 9:00 PM</li>
                </ul>
              </div>

              <div className="option-card">
                <div className="option-icon">🏪</div>
                <h3>Pickup</h3>
                <p>Order ahead and pick up at your convenience</p>
                <ul>
                  <li>No pickup fees</li>
                  <li>Ready in 15-20 minutes</li>
                  <li>Available during all operating hours</li>
                  <li>Dedicated pickup counter</li>
                </ul>
              </div>

              <div className="option-card">
                <div className="option-icon">🕐</div>
                <h3>Scheduled Delivery</h3>
                <p>Schedule your delivery for a specific time</p>
                <ul>
                  <li>Order up to 24 hours in advance</li>
                  <li>Choose your preferred time slot</li>
                  <li>Perfect for events and meetings</li>
                  <li>Same pricing as regular delivery</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Delivery Areas */}
          <section className="delivery-areas">
            <h2>Delivery Areas</h2>
            <div className="areas-content">
              <div className="areas-text">
                <p>We currently deliver to the following areas:</p>
                <div className="areas-list">
                  <div className="area-group">
                    <h4>Free Delivery Zone (Orders over $30)</h4>
                    <ul>
                      <li>Green Valley</li>
                      <li>Sunset Hills</li>
                      <li>Oak Park</li>
                      <li>Riverside District</li>
                      <li>Downtown Core</li>
                    </ul>
                  </div>
                  <div className="area-group">
                    <h4>Extended Delivery Zone ($4.99 fee)</h4>
                    <ul>
                      <li>Westside</li>
                      <li>North Hills</li>
                      <li>East Valley</li>
                      <li>Suburban Areas</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="areas-map">
                <div className="map-placeholder">
                  <p>🗺️ Delivery Zone Map</p>
                  <p>Check if we deliver to your area</p>
                </div>
              </div>
            </div>
          </section>

          {/* How to Order */}
          <section className="how-to-order">
            <h2>How to Order</h2>
            <div className="order-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Browse Menu</h3>
                  <p>Explore our conscious cuisine and add items to your cart</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Choose Delivery</h3>
                  <p>Select delivery or pickup and provide your details</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Make Payment</h3>
                  <p>Secure payment with card or cash on delivery</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Enjoy Your Meal</h3>
                  <p>Receive your fresh, conscious meal and enjoy!</p>
                </div>
              </div>
            </div>
          </section>

          {/* Delivery Policies */}
          <section className="delivery-policies">
            <h2>Delivery Policies</h2>
            <div className="policies-grid">
              <div className="policy-card">
                <h3>🕐 Delivery Times</h3>
                <ul>
                  <li>Monday - Friday: 11:00 AM - 9:00 PM</li>
                  <li>Saturday - Sunday: 11:00 AM - 10:00 PM</li>
                  <li>Peak hours: 12:00 PM - 2:00 PM, 6:00 PM - 8:00 PM</li>
                  <li>Delivery may take longer during peak hours</li>
                </ul>
              </div>

              <div className="policy-card">
                <h3>💳 Payment Options</h3>
                <ul>
                  <li>Credit/Debit Cards</li>
                  <li>Cash on Delivery</li>
                  <li>Digital Wallets</li>
                  <li>Gift Cards</li>
                </ul>
              </div>

              <div className="policy-card">
                <h3>📦 Packaging</h3>
                <ul>
                  <li>Eco-friendly, biodegradable containers</li>
                  <li>Secure packaging to maintain freshness</li>
                  <li>Temperature-controlled for hot/cold items</li>
                  <li>Recyclable materials wherever possible</li>
                </ul>
              </div>

              <div className="policy-card">
                <h3>❄️ Food Safety</h3>
                <ul>
                  <li>All food prepared fresh to order</li>
                  <li>Strict temperature control during transport</li>
                  <li>Contactless delivery available</li>
                  <li>Health and safety protocols followed</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact for Delivery */}
          <section className="delivery-contact">
            <h2>Questions About Delivery?</h2>
            <div className="contact-info">
              <p>
                Need help with your delivery or have questions about our service areas? 
                We're here to help!
              </p>
              <div className="contact-options">
                <div className="contact-option">
                  <div className="contact-icon">📞</div>
                  <div>
                    <h3>Call Us</h3>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="contact-option">
                  <div className="contact-icon">💬</div>
                  <div>
                    <h3>Live Chat</h3>
                    <p>Chat with our support team</p>
                  </div>
                </div>
                <div className="contact-option">
                  <div className="contact-icon">✉️</div>
                  <div>
                    <h3>Email</h3>
                    <p>delivery@consciouscafe.com</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Order Now */}
          <section className="order-now">
            <div className="order-cta">
              <h2>Ready to Order?</h2>
              <p>Experience conscious dining from the comfort of your home</p>
              <div className="cta-buttons">
                <a href="/menu" className="cta-btn">Order Food</a>
                <a href="/drinks" className="cta-btn secondary">Order Drinks</a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInfo;