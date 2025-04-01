import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiMapPin, FiMail, FiPhone } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: About */}
          <div>
            <h3 className="text-xl font-serif mb-4">Conscious Cafe</h3>
            <p className="mb-4 text-neutral-cream opacity-90">
              Where mindful dining meets community. Experience our sustainably sourced cuisine, yoga space, and vibrant events.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/consciouscafe" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-secondary transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram className="text-xl" />
              </a>
              <a 
                href="https://facebook.com/consciouscafe" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-secondary transition-colors"
                aria-label="Facebook"
              >
                <FiFacebook className="text-xl" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xl font-serif mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="opacity-90 hover:opacity-100 hover:text-secondary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="opacity-90 hover:opacity-100 hover:text-secondary transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/events" className="opacity-90 hover:opacity-100 hover:text-secondary transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/about" className="opacity-90 hover:opacity-100 hover:text-secondary transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/contact" className="opacity-90 hover:opacity-100 hover:text-secondary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Hours */}
          <div>
            <h3 className="text-xl font-serif mb-4">Hours</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Monday - Friday</span>
                <span>8:30am - 9:30pm</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday - Sunday</span>
                <span>8:30am - 9:30pm</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-xl font-serif mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FiMapPin className="mt-1 mr-2" />
                <span>Conscious Cafe, Kuilapalayam, Bommayapalayam, Auroville Road, Auroville, Puducherry 605101, India</span>
              </li>
              <li className="flex items-center">
                <FiPhone className="mr-2" />
                <span>123-456-7890</span>
              </li>
              <li className="flex items-center">
                <FiMail className="mr-2" />
                <a 
                  href="mailto:kavas.yoga@gmail.com"
                  className="hover:text-secondary transition-colors"
                >
                  kavas.yoga@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-white opacity-20 my-8"></div>
        
        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm opacity-80">
            © {new Date().getFullYear()} Kavas Conscious Living LLP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
