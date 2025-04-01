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
      className="fixed w-full z-50 transition-all duration-300"
    >
      {/* Always present backdrop with different styles based on scroll */}
      <div className={`absolute inset-0 ${
        scrolled 
          ? 'bg-white shadow-md' 
          : 'bg-black/40 backdrop-blur-sm'
      } -z-10`}></div>
      
      <div className="container-custom flex justify-between items-center py-4">
        {/* Logo */}
        <Link to="/" className="z-50">
          <h1 className={`text-2xl font-serif font-bold ${scrolled ? 'text-primary' : 'text-white'}`}>
            Conscious Cafe
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`text-sm font-medium transition-colors ${
                scrolled 
                  ? 'text-gray-800 hover:text-primary' 
                  : 'text-white hover:text-white/80'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <a 
            href="/#reservation" 
            className={`btn text-sm font-medium ${
              scrolled 
                ? 'bg-primary text-white hover:bg-primary-dark' 
                : 'bg-white text-primary hover:bg-neutral-cream'
            }`}
          >
            Reserve a Table
          </a>
        </nav>

        {/* Mobile Navigation Button */}
        <button
          className={`md:hidden z-50 text-2xl ${scrolled ? 'text-gray-800' : 'text-white'}`}
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
          className="absolute top-0 left-0 w-full h-screen bg-black/95 backdrop-blur-md flex flex-col md:hidden"
        >
          <div className="container mx-auto px-4 pt-24 pb-12 flex flex-col items-center space-y-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-white text-xl font-medium hover:text-primary-light"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <a 
              href="/#reservation" 
              className="btn bg-primary text-white hover:bg-primary-dark text-base font-medium mt-4"
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
