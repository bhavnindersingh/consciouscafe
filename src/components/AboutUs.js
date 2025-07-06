import React from 'react';

const AboutUs = () => {
  return (
    <div className="about-us-page">
      {/* Hero Section */}
      <div className="hero about-hero">
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1200&h=400&fit=crop&crop=center" 
            alt="About Conscious Cafe" 
            className="hero-bg-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1>About Conscious Cafe</h1>
            <p>Where mindful eating meets exceptional taste</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="about-content">
        <div className="container">
          {/* Our Story Section */}
          <section className="about-section">
            <div className="about-text">
              <h2>Our Story</h2>
              <p>
                Founded with a passion for conscious living and exceptional taste, Conscious Cafe is more than just a restaurant – it's a movement towards mindful eating and sustainable practices. We believe that every meal should nourish both body and soul while respecting our planet.
              </p>
              <p>
                Our journey began with a simple vision: to create a space where people could enjoy delicious, wholesome food that's prepared with love, sourced responsibly, and served with care. Every dish on our menu reflects our commitment to quality, sustainability, and your well-being.
              </p>
            </div>
            <div className="about-image">
              <img 
                src="https://images.unsplash.com/photo-1600891964092-4316c288032e?w=500&h=400&fit=crop" 
                alt="Our Story" 
              />
            </div>
          </section>

          {/* Our Mission Section */}
          <section className="about-section reverse">
            <div className="about-text">
              <h2>Our Mission</h2>
              <p>
                At Conscious Cafe, we're committed to serving food that's not only delicious but also ethically sourced and environmentally responsible. We work closely with local farmers and suppliers who share our values of sustainability and quality.
              </p>
              <p>
                Every ingredient is carefully selected, every dish thoughtfully prepared, and every customer warmly welcomed. We believe that conscious choices create positive change – one meal at a time.
              </p>
            </div>
            <div className="about-image">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=400&fit=crop" 
                alt="Our Mission" 
              />
            </div>
          </section>

          {/* Our Values Section */}
          <section className="values-section">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-item">
                <div className="value-icon">🌱</div>
                <h3>Sustainability</h3>
                <p>We prioritize eco-friendly practices in everything we do, from sourcing to packaging.</p>
              </div>
              <div className="value-item">
                <div className="value-icon">❤️</div>
                <h3>Quality</h3>
                <p>Only the finest ingredients make it to your plate, ensuring exceptional taste and nutrition.</p>
              </div>
              <div className="value-item">
                <div className="value-icon">🤝</div>
                <h3>Community</h3>
                <p>We support local farmers and suppliers, building stronger communities together.</p>
              </div>
              <div className="value-item">
                <div className="value-icon">🌟</div>
                <h3>Wellness</h3>
                <p>Every dish is crafted to nourish your body and support your healthy lifestyle.</p>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="team-section">
            <h2>Meet Our Team</h2>
            <p>Behind every great meal is a passionate team dedicated to bringing you the best experience.</p>
            <div className="team-grid">
              <div className="team-member">
                <img 
                  src="https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=300&h=300&fit=crop&crop=face" 
                  alt="Chef" 
                />
                <h3>Chef Sarah</h3>
                <p>Head Chef & Co-Founder</p>
                <p>With over 15 years of culinary experience, Sarah brings creativity and passion to every dish.</p>
              </div>
              <div className="team-member">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face" 
                  alt="Manager" 
                />
                <h3>Alex Kumar</h3>
                <p>Restaurant Manager</p>
                <p>Alex ensures every guest feels welcomed and enjoys an exceptional dining experience.</p>
              </div>
              <div className="team-member">
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616b332c264?w=300&h=300&fit=crop&crop=face" 
                  alt="Nutritionist" 
                />
                <h3>Dr. Maya Patel</h3>
                <p>Nutritionist</p>
                <p>Maya helps us create balanced, nutritious meals that support your wellness goals.</p>
              </div>
            </div>
          </section>

          {/* Visit Us Section */}
          <section className="visit-section">
            <h2>Visit Us Today</h2>
            <p>
              Ready to experience conscious dining? We'd love to welcome you to our cafe. 
              Come taste the difference that mindful preparation and quality ingredients make.
            </p>
            <div className="visit-actions">
              <a href="/contact" className="cta-btn">Find Us</a>
              <a href="/menu" className="cta-btn secondary">View Menu</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;