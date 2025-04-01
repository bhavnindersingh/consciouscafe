import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Events', path: '/events' },
    { name: 'Our Story', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white bg-opacity-95 shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container-custom flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="z-50">
          <h1 className="text-2xl font-serif font-bold text-primary">
            Conscious Cafe
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className="nav-link text-sm font-medium"
            >
              {link.name}
            </Link>
          ))}
          <a 
            href="/#reservation" 
            className="btn btn-primary text-sm font-medium"
          >
            Reserve a Table
          </a>
        </nav>

        {/* Mobile Navigation Button */}
        <button
          className="md:hidden z-50 text-2xl"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-0 left-0 w-full h-screen bg-white flex flex-col md:hidden"
        >
          <div className="container mx-auto px-4 pt-24 pb-12 flex flex-col items-center space-y-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-xl font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <a 
              href="/#reservation" 
              className="btn btn-primary text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Reserve a Table
            </a>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;
