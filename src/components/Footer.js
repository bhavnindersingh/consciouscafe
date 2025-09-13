import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h2>Conscious Cafe</h2>
            <p>Experience conscious cuisine crafted with care.</p>
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
              <li><Link to="/menu">Food Menu</Link></li>
              <li><Link to="/drinks">Drinks Menu</Link></li>
              <li><Link to="/">Bestsellers</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Information</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/delivery">Delivery Info</Link></li>
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
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
