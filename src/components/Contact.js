import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="hero contact-hero">
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&h=400&fit=crop&crop=center" 
            alt="Contact Us" 
            className="hero-bg-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1>Contact Us</h1>
            <p>We'd love to hear from you. Get in touch with us today!</p>
          </div>
        </div>
      </div>

      {/* Contact Content */}
      <div className="contact-content">
        <div className="container">
          <div className="contact-wrapper">
            {/* Contact Information */}
            <div className="contact-info">
              <h2>Get In Touch</h2>
              <p>
                Have questions, feedback, or want to make a reservation? 
                We're here to help and would love to hear from you.
              </p>

              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-icon">📍</div>
                  <div className="contact-text">
                    <h3>Location</h3>
                    <p>123 Conscious Street<br />Green Valley, CA 90210</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">📞</div>
                  <div className="contact-text">
                    <h3>Phone</h3>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">✉️</div>
                  <div className="contact-text">
                    <h3>Email</h3>
                    <p>hello@consciouscafe.com</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">⏰</div>
                  <div className="contact-text">
                    <h3>Hours</h3>
                    <p>
                      Monday - Friday: 7:00 AM - 9:00 PM<br />
                      Saturday - Sunday: 8:00 AM - 10:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="social-media">
                <h3>Follow Us</h3>
                <div className="social-links">
                  <a href="#" className="social-link">📘 Facebook</a>
                  <a href="#" className="social-link">📸 Instagram</a>
                  <a href="#" className="social-link">🐦 Twitter</a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form">
              <h2>Send Us A Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="reservation">Reservation</option>
                    <option value="feedback">Feedback</option>
                    <option value="catering">Catering</option>
                    <option value="custom-order">Custom Order</option>
                    <option value="complaint">Complaint</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Map Section */}
          <div className="map-section">
            <h2>Find Us</h2>
            <div className="map-container">
              <div className="map-placeholder">
                <p>🗺️ Interactive Map</p>
                <p>123 Conscious Street, Green Valley, CA 90210</p>
                <p>
                  <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                    View on Google Maps
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <a href="/menu" className="action-btn">
                <span>🍽️</span>
                <div>
                  <h3>View Menu</h3>
                  <p>Explore our conscious cuisine</p>
                </div>
              </a>
              <a href="/delivery" className="action-btn">
                <span>🚚</span>
                <div>
                  <h3>Delivery Info</h3>
                  <p>Learn about our delivery options</p>
                </div>
              </a>
              <a href="/custom-orders" className="action-btn">
                <span>👨‍🍳</span>
                <div>
                  <h3>Custom Orders</h3>
                  <p>Create your perfect meal</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;