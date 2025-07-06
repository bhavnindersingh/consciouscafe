import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Conscious Cafe</h3>
            <p>Mindful eating meets exceptional taste - conscious cuisine made with love and sustainable ingredients.</p>
            <div className="social-links">
              <a href="#" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" aria-label="WhatsApp">
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Menu</h4>
            <ul>
              <li><a href="/menu">Food Menu</a></li>
              <li><a href="/drinks">Drinks Menu</a></li>
              <li><a href="/">Bestsellers</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Information</h4>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/delivery">Delivery Info</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Opening Hours</h4>
            <ul>
              <li>Open All Day: 9:00 AM - 9:30 PM</li>
              <li>Tuesday: Closed</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Conscious Cafe. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
