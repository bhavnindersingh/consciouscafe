import React from "react";
import SEO from "./SEO";
import { generatePageSEO, generateStructuredData } from "../utils/seoData";

const DeliveryInfo = () => {
  // Generate SEO data for delivery page
  const seoData = generatePageSEO('delivery', {
    structuredData: [
      generateStructuredData('restaurant'),
      generateStructuredData('breadcrumb', {
        items: [
          { name: 'Home', url: '/' },
          { name: 'Delivery Information', url: '/delivery' },
        ]
      })
    ]
  });

  return (
    <div className="delivery-info-page">
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={seoData.url}
        structuredData={seoData.structuredData}
      />
      <div className="delivery-container">
        <header className="delivery-header">
          <h1>Delivery Information</h1>
          <p>Everything you need to know about our delivery service</p>
        </header>

        <div className="delivery-content">
          <section className="delivery-section">
            <h2>🚚 Delivery Areas</h2>
            <p>We currently deliver to the following areas:</p>
            <ul className="delivery-areas">
              <li>Downtown District (Free delivery)</li>
              <li>Uptown Area ($3 delivery fee)</li>
              <li>Suburban Zone ($5 delivery fee)</li>
              <li>Extended Area ($8 delivery fee)</li>
            </ul>
          </section>

          <section className="delivery-section">
            <h2>⏰ Delivery Hours</h2>
            <div className="delivery-hours">
              <div className="hours-item">
                <strong>Monday - Friday:</strong>
                <span>11:00 AM - 9:00 PM</span>
              </div>
              <div className="hours-item">
                <strong>Saturday - Sunday:</strong>
                <span>10:00 AM - 10:00 PM</span>
              </div>
            </div>
          </section>

          <section className="delivery-section">
            <h2>💳 Payment Methods</h2>
            <ul className="payment-methods">
              <li>Credit/Debit Cards</li>
              <li>Cash on Delivery</li>
              <li>Digital Wallets</li>
              <li>Online Banking</li>
            </ul>
          </section>

          <section className="delivery-section">
            <h2>📋 Delivery Policy</h2>
            <div className="policy-grid">
              <div className="policy-item">
                <h3>🕐 Estimated Time</h3>
                <p>30-45 minutes for standard delivery</p>
              </div>

              <div className="policy-item">
                <h3>💰 Minimum Order</h3>
                <p>$15 minimum for delivery orders</p>
              </div>

              <div className="policy-item">
                <h3>🔄 Order Changes</h3>
                <p>Changes accepted within 5 minutes of placing order</p>
              </div>

              <div className="policy-item">
                <h3>📞 Contact</h3>
                <p>Call us at +1 (555) 123-4567 for any delivery inquiries</p>
              </div>
            </div>
          </section>

          <section className="delivery-section">
            <h2>🌟 Special Offers</h2>
            <div className="offers">
              <div className="offer-item">
                <h3>Free Delivery Friday</h3>
                <p>Free delivery on all orders above $25 every Friday!</p>
              </div>

              <div className="offer-item">
                <h3>Bulk Order Discount</h3>
                <p>10% off on orders above $50 + free delivery</p>
              </div>
            </div>
          </section>

          <div className="delivery-cta">
            <h3>Ready to Order?</h3>
            <p>
              Browse our menu and enjoy fresh, conscious food delivered to your
              door!
            </p>
            <button
              className="order-now-button"
              onClick={() => (window.location.href = "/")}
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInfo;
