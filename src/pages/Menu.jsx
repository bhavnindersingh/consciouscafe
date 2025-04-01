import React from 'react';
import { motion } from 'framer-motion';
import HeyzineMenu from '../components/HeyzineMenu';
import { FiDownload } from 'react-icons/fi';

// Placeholder menu category images
const drinksImage = "https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80";
const mainCourseImage = "https://images.unsplash.com/photo-1604909052743-94e838986d24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80";
const dessertsImage = "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80";

const Menu = () => {
  return (
    <div className="pt-16">
      {/* Menu Page Hero */}
      <section className="bg-neutral-cream py-16 md:py-24">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4">Our Menu</h1>
            <p className="text-lg text-gray-600 mb-8">
              Explore our consciously crafted dishes made with love, using locally sourced ingredients.
              We prioritize sustainable practices while offering global flavors with a local twist.
            </p>
            <div className="flex justify-center gap-4">
              <a href="#interactive-menu" className="btn btn-primary">
                View Interactive Menu
              </a>
              <a 
                href="/menu.pdf" 
                download 
                className="btn btn-outline inline-flex items-center"
              >
                <FiDownload className="mr-2" />
                Download PDF Menu
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Menu Categories Overview */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-serif mb-4">Menu Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our menu changes seasonally to incorporate the freshest ingredients available from our local partners.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Drinks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-neutral-cream rounded-lg overflow-hidden shadow-lg"
            >
              <div className="h-64 overflow-hidden">
                <img 
                  src={drinksImage} 
                  alt="Conscious Cafe Drinks" 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif mb-2">Beverages</h3>
                <p className="text-gray-600 mb-4">
                  From freshly brewed coffee to our signature herbal teas and refreshing smoothies, our drinks are crafted with quality ingredients.
                </p>
                <a href="#interactive-menu" className="text-primary font-medium hover:underline">
                  View Drinks Menu →
                </a>
              </div>
            </motion.div>
            
            {/* Main Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-neutral-cream rounded-lg overflow-hidden shadow-lg"
            >
              <div className="h-64 overflow-hidden">
                <img 
                  src={mainCourseImage} 
                  alt="Conscious Cafe Main Courses" 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif mb-2">Main Courses</h3>
                <p className="text-gray-600 mb-4">
                  Discover our selection of nutrient-rich bowls, gourmet sandwiches, and global-inspired vegetarian and vegan dishes.
                </p>
                <a href="#interactive-menu" className="text-primary font-medium hover:underline">
                  View Main Courses →
                </a>
              </div>
            </motion.div>
            
            {/* Desserts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-neutral-cream rounded-lg overflow-hidden shadow-lg"
            >
              <div className="h-64 overflow-hidden">
                <img 
                  src={dessertsImage} 
                  alt="Conscious Cafe Desserts" 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif mb-2">Desserts</h3>
                <p className="text-gray-600 mb-4">
                  Indulge in our selection of guilt-free, naturally sweetened treats made with organic ingredients and lots of love.
                </p>
                <a href="#interactive-menu" className="text-primary font-medium hover:underline">
                  View Desserts →
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dietary Information */}
      <section className="py-12 bg-neutral-cream">
        <div className="container-custom">
          <div className="bg-white rounded-lg p-8 shadow-md">
            <h3 className="text-2xl font-serif mb-6 text-center">Dietary Information</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <span className="text-green-600 font-bold">VG</span>
                </div>
                <h4 className="font-medium mb-1">Vegan Options</h4>
                <p className="text-sm text-gray-600">Plant-based dishes free from all animal products</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-3">
                  <span className="text-yellow-600 font-bold">GF</span>
                </div>
                <h4 className="font-medium mb-1">Gluten Free</h4>
                <p className="text-sm text-gray-600">Dishes free from wheat and gluten-containing ingredients</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-3">
                  <span className="text-red-600 font-bold">SF</span>
                </div>
                <h4 className="font-medium mb-1">Sugar Free</h4>
                <p className="text-sm text-gray-600">No refined sugars, naturally sweetened</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <span className="text-blue-600 font-bold">LF</span>
                </div>
                <h4 className="font-medium mb-1">Lactose Free</h4>
                <p className="text-sm text-gray-600">Dishes free from dairy and lactose</p>
              </div>
            </div>
            <p className="text-center mt-6 text-gray-600 text-sm">
              Please inform our staff about any allergies or dietary requirements when ordering
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Menu Section */}
      <section id="interactive-menu" className="scroll-mt-20">
        <HeyzineMenu />
      </section>

      {/* Online Ordering CTA */}
      <section className="py-16 bg-primary">
        <div className="container-custom">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Order Online</h2>
            <p className="max-w-2xl mx-auto mb-8">
              Enjoy our conscious cuisine in the comfort of your home. Place your order online for pickup or delivery.
            </p>
            <a href="#order" className="btn bg-white text-primary hover:bg-neutral-cream">
              Order Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Menu;
