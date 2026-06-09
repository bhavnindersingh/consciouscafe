import React from "react";
import SEO from "../../components/seo/SEO/SEO";
import { generatePageSEO, generateStructuredData } from "../../utils/seoData";

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
      
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <h1>Conscious Food Delivery</h1>
            <p className="about-hero-subtitle">
              Experience mindful dining at home. Fresh, organic, conscious food delivered with care to your doorstep across Auroville and beyond
            </p>
          </div>
        </div>
      </section>

      {/* Quick Delivery Overview */}
      <section className="values-section">
        <div className="container">
          <h2>Delivery Areas</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🏛️</div>
              <h3>Auroville Community</h3>
              <p><em>Supporting our local community</em></p>
            </div>
            <div className="value-card">
              <div className="value-icon">🏡</div>
              <h3>Kuilapalayam &amp; Nearby</h3>
              <p><em>Local neighborhoods welcome</em></p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌊</div>
              <h3>Pondicherry City</h3>
              <p><em>Serving the French Quarter &amp; beyond</em></p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌾</div>
              <h3>Extended Areas</h3>
              <p><em>Contact us to confirm availability</em></p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Delivery Promise Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-content">
            <div className="story-image">
              <img 
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop&crop=center" 
                alt="Fresh organic food delivery - sustainable packaging and conscious ingredients" 
              />
            </div>
            <div className="story-text">
              <h2>Our Delivery Promise</h2>
              <p className="story-intro">
                We believe that conscious eating shouldn't be limited by location. Our delivery service 
                extends the Conscious Cafe experience beyond our physical space, bringing fresh, 
                organic, and mindfully prepared meals directly to your home or workspace.
              </p>
              <div className="experience-features">
                <div className="feature">
                  <span className="feature-icon">🌱</span>
                  <span>Fresh ingredients sourced daily</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">♻️</span>
                  <span>Eco-friendly packaging materials</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🚚</span>
                  <span>30-45 minute delivery window</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">❤️</span>
                  <span>Prepared with love and mindfulness</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Details Section */}
      <section className="values-section">
        <div className="container">
          <h2>Delivery Details</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🕐</div>
              <h3>Delivery Hours</h3>
              <p>
                Mon &amp; Wed–Sun during cafe hours<br />
                Tuesday: Closed<br />
                <em>30-45 minutes estimated delivery</em>
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">💰</div>
              <h3>Order Requirements</h3>
              <p>
                <em>Contact us for minimum order and fee details</em>
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">♻️</div>
              <h3>Sustainable Packaging</h3>
              <p>
                Eco-friendly containers<br />
                Biodegradable materials<br />
                <em>Caring for our planet</em>
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">💳</div>
              <h3>Payment Options</h3>
              <p>
                Cards, UPI, Cash on Delivery<br />
                Digital wallets accepted<br />
                <em>Choose your preferred method</em>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Order Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>How to Order</h2>
              <p className="story-intro">
                Ordering conscious food is simple and mindful. We've designed our process 
                to be as seamless as possible while maintaining our commitment to quality and sustainability.
              </p>
              <div className="experience-features">
                <div className="feature">
                  <span className="feature-icon">📱</span>
                  <span>Browse our online menu or call us directly</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🍽️</span>
                  <span>Choose from fresh daily specials & signature dishes</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🚚</span>
                  <span>Your food is prepared fresh & delivered with care</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">😋</span>
                  <span>Enjoy conscious dining at home or office</span>
                </div>
              </div>
            </div>
            <div className="story-image">
              <img 
                src="https://images.unsplash.com/photo-1556909114-1ba207cf5c06?w=600&h=400&fit=crop&crop=center" 
                alt="Fresh prepared meals ready for delivery - conscious cafe quality at home" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="experience-section">
        <div className="container">
          <div className="experience-content">
            <h2>Start Your Conscious Food Journey</h2>
            <p>
              Ready to experience mindful dining at home? Browse our carefully crafted menu 
              of fresh, organic, and delicious meals. Every order supports our commitment to 
              sustainable living and conscious eating.
            </p>
            <div className="hero-buttons">
              <button
                className="cta-btn"
                onClick={() => (window.location.href = "/menu")}
              >
                Order Food Now
              </button>
              <button
                className="cta-btn"
                onClick={() => (window.location.href = "/drinks")}
              >
                Browse Drinks
              </button>
            </div>
            <div style={{marginTop: '40px', padding: '20px', background: 'rgba(38, 83, 43, 0.1)', borderRadius: '12px'}}>
              <p style={{margin: '0', color: '#26532B', fontWeight: '600'}}>
                💡 <strong>Pro Tip:</strong> Follow us on Instagram <strong>@consciouscafe.sanctuary</strong> for daily
                specials, behind-the-scenes content, and updates on our sustainability initiatives.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DeliveryInfo;
