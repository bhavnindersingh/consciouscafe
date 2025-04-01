import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCoffee, FiMenu } from 'react-icons/fi';

const HeyzineMenu = () => {
  const [activeMenu, setActiveMenu] = useState('food');
  
  const menuUrls = {
    food: "https://heyzine.com/flip-book/7e24b7ffce.html",
    drinks: "https://heyzine.com/flip-book/51bc0650cb.html"
  };

  return (
    <section className="section-padding bg-neutral-cream">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Our Menu</h2>
          <p className="max-w-2xl mx-auto text-gray-600 mb-6">
            Explore our seasonal offerings featuring locally-sourced ingredients and global flavors.
            Flip through the pages to discover our carefully crafted dishes and beverages.
          </p>
          
          {/* Menu Toggle Controls */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm bg-white p-1">
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2 rounded-md ${
                  activeMenu === 'food'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } transition-colors duration-200 text-sm font-medium`}
                onClick={() => setActiveMenu('food')}
              >
                <FiMenu className="mr-2" />
                Food Menu
              </button>
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2 ml-1 rounded-md ${
                  activeMenu === 'drinks'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } transition-colors duration-200 text-sm font-medium`}
                onClick={() => setActiveMenu('drinks')}
              >
                <FiCoffee className="mr-2" />
                Drinks Menu
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          key={activeMenu}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full rounded-lg overflow-hidden shadow-xl"
        >
          {/* Heyzine Flipbook Embed */}
          <div className="relative w-full" style={{ paddingTop: '70%' }}>
            <iframe 
              src={menuUrls[activeMenu]}
              className="absolute top-0 left-0 w-full h-full border-0" 
              allowFullScreen
              title={`Conscious Cafe ${activeMenu === 'food' ? 'Food' : 'Drinks'} Menu`}
              loading="lazy"
            ></iframe>
          </div>
        </motion.div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Can't view the menu? 
            <a 
              href={activeMenu === 'food' 
                ? "https://heyzine.com/flip-book/7e24b7ffce.html" 
                : "https://heyzine.com/flip-book/51bc0650cb.html"} 
              className="text-primary ml-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in new tab
            </a>
          </p>
          <a href="#order" className="btn btn-primary inline-block">
            Order Online
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeyzineMenu;
