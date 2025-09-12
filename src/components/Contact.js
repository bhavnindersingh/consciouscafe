import React, { useState } from "react";
import SEO from "./SEO";
import { generatePageSEO, generateStructuredData } from "../utils/seoData";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Contact form submitted:", formData);
    alert("Thank you for your message! We will get back to you soon.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  // Generate SEO data for contact page
  const seoData = generatePageSEO('contact', {
    structuredData: [
      generateStructuredData('restaurant'),
      generateStructuredData('breadcrumb', {
        items: [
          { name: 'Home', url: '/' },
          { name: 'Contact Us', url: '/contact' },
        ]
      })
    ]
  });

  return (
    <div className="contact-page">
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
            <h1>Visit & Connect</h1>
            <p className="about-hero-subtitle">
              Come experience conscious dining in Auroville or reach out to connect with our community
            </p>
          </div>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="values-section">
        <div className="container">
          <h2>Ways to Connect</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🏠</div>
              <h3>Visit Our Cafe</h3>
              <p>
                Auroville Road, Kuilapalayam<br />
                Daily: 8:00 AM - 9:00 PM<br />
                <em>Walk-ins welcome, no reservation needed</em>
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">📱</div>
              <h3>Follow Us Online</h3>
              <p>
                Instagram: @consciouscafe.kavas<br />
                Website: consciouscafe.in<br />
                <em>Daily specials & event updates</em>
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">📍</div>
              <h3>Easy to Find</h3>
              <p>
                Just 10 minutes from Pondicherry<br />
                In the heart of Auroville<br />
                <em>Look for the green conscious cafe sign</em>
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">🚚</div>
              <h3>Order Delivery</h3>
              <p>
                Free delivery within Auroville<br />
                Extended areas available<br />
                <em>Fresh food delivered with care</em>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Send Us a Message</h2>
              <p className="story-intro">
                Planning a special event? Have dietary questions? Want to collaborate? 
                Or simply want to share your conscious eating journey with us? We'd love to hear from you.
              </p>
              <div className="contact-form-container">
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone (Optional)</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="Tell us about your visit plans, event ideas, dietary needs, or just say hello..."
                    ></textarea>
                  </div>

                  <button type="submit" className="cta-btn">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
            <div className="story-image">
              <img 
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop&crop=center" 
                alt="Conscious Cafe interior - welcoming community space" 
              />
              <div style={{marginTop: '20px', padding: '20px', background: '#f8f8f8', borderRadius: '12px'}}>
                <h2 style={{color: '#26532B', marginBottom: '15px'}}>What makes us special?</h2>
                <div className="experience-features">
                  <div className="feature">
                    <span className="feature-icon">🌱</span>
                    <span>100% organic ingredients</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🧘‍♀️</span>
                    <span>Mindful eating environment</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🤝</span>
                    <span>Community-centered approach</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Activities Section */}
      <section className="founders-section">
        <div className="container">
          <h2>Join Our Community Activities</h2>
          <div className="founders-grid">
            <div className="founder-card">
              <div className="founder-image">
                <span style={{fontSize: '48px'}}>🧘‍♀️</span>
              </div>
              <h3>Weekly Yoga Sessions</h3>
              <p>Every Tuesday & Thursday at 7:00 AM. Start your day mindfully with community yoga practice in our garden space.</p>
            </div>

            <div className="founder-card">
              <div className="founder-image">
                <span style={{fontSize: '48px'}}>🌱</span>
              </div>
              <h3>Sustainability Workshops</h3>
              <p>Monthly workshops on composting, zero-waste living, and conscious consumption. Learn practical skills for sustainable living.</p>
            </div>

            <div className="founder-card">
              <div className="founder-image">
                <span style={{fontSize: '48px'}}>🎪</span>
              </div>
              <h3>Community Events</h3>
              <p>Regular potlucks, live music evenings, and seasonal celebrations. Check our Instagram for upcoming events and gatherings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="experience-section">
        <div className="container">
          <div className="experience-content">
            <h2>Ready to Experience Conscious Dining?</h2>
            <p>
              Whether you visit us in person or connect online, you're joining a movement towards 
              mindful eating and sustainable living in the heart of Auroville.
            </p>
            <div className="hero-buttons">
              <button className="cta-btn" onClick={() => window.location.href = '/menu'}>
                View Our Menu
              </button>
              <button className="cta-btn" onClick={() => window.location.href = '/about'}>
                Our Story
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
