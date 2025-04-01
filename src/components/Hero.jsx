import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Note: In a real implementation, you'd import actual image files
// For now, we'll use placeholder URLs
const heroImage = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1950&q=80";

const Hero = () => {
  return (
    <div className="relative h-screen">
      {/* Hero Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black opacity-40 z-10"></div>
        <img
          src={heroImage}
          alt="Conscious Cafe"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Hero Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white"
          >
            <h1 className="text-4xl md:text-6xl font-serif mb-4">
              Fresh, Healthy, Made With Love
            </h1>
            <p className="text-lg md:text-xl mb-8">
              We reimagine global favorites with a local twist, using only fresh, sustainably sourced ingredients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/menu" className="btn btn-primary text-center">
                Explore Our Menu
              </Link>
              <a href="#reservation" className="btn bg-white text-gray-800 hover:bg-gray-100 text-center">
                Reserve a Table
              </a>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <div className="w-6 h-9 rounded-full border-2 border-white flex justify-center pt-1">
          <div className="w-1 h-2 bg-white rounded-full"></div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
