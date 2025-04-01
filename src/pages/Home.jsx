import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import HeyzineMenu from '../components/HeyzineMenu';
import InstagramFeed from '../components/InstagramFeed';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUser, FiCoffee, FiPhone } from 'react-icons/fi';

// Image placeholders
const aboutImage = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80";
const foodImage1 = "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80";
const foodImage2 = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=781&q=80";

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <Hero />
      
      {/* About Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 md:order-1"
            >
              <h2 className="text-3xl md:text-4xl font-serif mb-4">Food, yoga & community</h2>
              <p className="mb-6 text-gray-600">
                We unite vegetarian and vegan cuisine with a dedicated yoga studio and community space. Enjoy nourishing dishes crafted from fresh, sustainable ingredients while embracing well-being through our yoga sessions. Join us to connect, share, and grow in a supportive environment!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/about" className="btn btn-outline text-center">
                  Our Story
                </Link>
                <Link to="/events" className="btn btn-primary text-center">
                  Upcoming Events
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <img 
                src={aboutImage} 
                alt="Our Community Space" 
                className="rounded-lg shadow-lg h-[400px] w-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="section-padding bg-neutral-cream">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Our Values</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-8 shadow-md text-center"
            >
              <div className="bg-primary-light bg-opacity-20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiUser className="text-2xl text-primary" />
              </div>
              <h3 className="text-xl font-serif mb-4">Community</h3>
              <p className="text-gray-600">
                Join us for classes, workshops, and events that foster growth, wellness, and community.
              </p>
            </motion.div>
            
            {/* Value 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-8 shadow-md text-center"
            >
              <div className="bg-primary-light bg-opacity-20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiCoffee className="text-2xl text-primary" />
              </div>
              <h3 className="text-xl font-serif mb-4">Sustainability</h3>
              <p className="text-gray-600">
                We prioritize natural ingredients and unprocessed foods in every dish we create.
              </p>
            </motion.div>
            
            {/* Value 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-8 shadow-md text-center"
            >
              <div className="bg-primary-light bg-opacity-20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="text-2xl text-primary" />
              </div>
              <h3 className="text-xl font-serif mb-4">Integrity</h3>
              <p className="text-gray-600">
                We uphold high accountability in hospitality. Our commitment ensures exceptional guest experiences.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Featured Menu Items */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Featured Dishes</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              A taste of our popular offerings, crafted with love and local ingredients.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Dish 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-neutral-cream rounded-lg overflow-hidden shadow-lg"
            >
              <img 
                src={foodImage1} 
                alt="Bahn Mi Sub" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-serif mb-2">Bahn Mi Sub</h3>
                <p className="text-gray-600 mb-4">
                  Our latest edition featuring crusty artisan bread, marinated tofu, fresh vegetables, and house-made aioli.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-medium">₹320</span>
                  <a href="#order" className="text-primary hover:underline">Order Now</a>
                </div>
              </div>
            </motion.div>
            
            {/* Dish 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-neutral-cream rounded-lg overflow-hidden shadow-lg"
            >
              <img 
                src={foodImage2} 
                alt="Zulfi Platter" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-serif mb-2">Zulfi Platter</h3>
                <p className="text-gray-600 mb-4">
                  A vibrant Mediterranean-inspired platter with falafel, hummus, tabbouleh, and warm pita bread.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-medium">₹380</span>
                  <a href="#order" className="text-primary hover:underline">Order Now</a>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="text-center mt-8">
            <Link to="/menu" className="btn btn-primary">
              View Full Menu
            </Link>
          </div>
        </div>
      </section>
      
      {/* Heyzine Menu Section */}
      <HeyzineMenu />
      
      {/* Reservation Section */}
      <section id="reservation" className="section-padding bg-primary">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <h2 className="text-3xl md:text-4xl font-serif mb-4">Reserve Your Table</h2>
              <p className="mb-6">
                Join us for a mindful dining experience in our tranquil space. Make a reservation to ensure your spot.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="w-1 h-1 bg-white rounded-full mr-2"></span>
                  <span>Enjoy our seasonal menu in a peaceful setting</span>
                </li>
                <li className="flex items-center">
                  <span className="w-1 h-1 bg-white rounded-full mr-2"></span>
                  <span>Special accommodations for groups and events</span>
                </li>
                <li className="flex items-center">
                  <span className="w-1 h-1 bg-white rounded-full mr-2"></span>
                  <span>Dietary preferences happily accommodated</span>
                </li>
              </ul>
              <a
                href="tel:+91123456789" 
                className="btn bg-white text-primary hover:bg-neutral-cream inline-flex items-center"
              >
                <FiPhone className="mr-2" />
                Call for Reservations
              </a>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-serif mb-4 text-center">Book a Table</h3>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your Email"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        id="date"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <input
                        type="time"
                        id="time"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                    <select
                      id="guests"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select</option>
                      <option value="1">1 Person</option>
                      <option value="2">2 People</option>
                      <option value="3">3 People</option>
                      <option value="4">4 People</option>
                      <option value="5">5 People</option>
                      <option value="6+">6+ People</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                    <textarea
                      id="notes"
                      rows="3"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Any dietary requirements or special occasions"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full btn btn-primary"
                  >
                    Reserve Now
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Instagram Feed */}
      <InstagramFeed />
    </div>
  );
};

export default Home;
