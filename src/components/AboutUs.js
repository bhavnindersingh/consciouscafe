import React from "react";

const AboutUs = () => {
  return (
    <div className="about-us-page">
      <div className="about-container">
        <header className="about-header">
          <h1>About Conscious Cafe</h1>
          <p className="about-subtitle">Premium Artisanal Food & Beverages</p>
        </header>

        <section className="about-content">
          <div className="about-section">
            <h2>Our Story</h2>
            <p>
              Welcome to Conscious Cafe, where we believe in serving food that
              nourishes both body and soul. Our journey began with a simple
              vision: to create a space where conscious eating meets exceptional
              taste.
            </p>
          </div>

          <div className="about-section">
            <h2>Our Mission</h2>
            <p>
              We are committed to providing fresh, wholesome, and sustainably
              sourced ingredients in every dish we serve. From our artisanal
              toasts to our nourishing earth bowls, every item on our menu is
              crafted with care and consciousness.
            </p>
          </div>

          <div className="about-section">
            <h2>What Makes Us Special</h2>
            <ul className="about-features">
              <li>🌱 Fresh, locally sourced ingredients</li>
              <li>🍽️ Artisanal preparation methods</li>
              <li>💚 Sustainable and eco-friendly practices</li>
              <li>🌟 Unique and creative flavor combinations</li>
              <li>❤️ Made with love and consciousness</li>
            </ul>
          </div>

          <div className="about-section">
            <h2>Visit Us</h2>
            <p>
              Come experience the difference that conscious eating can make. We
              look forward to serving you soon!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
