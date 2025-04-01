import React from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail, FiClock, FiInstagram, FiFacebook } from 'react-icons/fi';

// Placeholder images
const contactImage = "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";

const Contact = () => {
  return (
    <div className="pt-16">
      {/* Contact Hero */}
      <section className="relative h-[50vh]">
        <div className="absolute inset-0">
          <img 
            src={contactImage} 
            alt="Contact Conscious Cafe" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl text-white"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4">Contact Us</h1>
              <p className="text-xl mb-6">
                We'd love to hear from you. Reach out with any questions about our menu, events, or yoga classes.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-serif mb-6">Get In Touch</h2>
              
              <div className="space-y-8 mb-8">
                <div className="flex items-start">
                  <div className="mr-4 bg-primary-light bg-opacity-20 p-3 rounded-full text-primary">
                    <FiMapPin className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Visit Us</h3>
                    <p className="text-gray-600">
                      Conscious Cafe, Kuilapalayam, Bommayapalayam, Auroville Road, Auroville, Puducherry 605101, India
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 bg-primary-light bg-opacity-20 p-3 rounded-full text-primary">
                    <FiClock className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Opening Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 8:30 AM - 9:30 PM<br />
                      Saturday - Sunday: 8:30 AM - 9:30 PM
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 bg-primary-light bg-opacity-20 p-3 rounded-full text-primary">
                    <FiPhone className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Call Us</h3>
                    <p className="text-gray-600">
                      <a href="tel:+91123456789" className="hover:text-primary">
                        +91 123-456-7890
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 bg-primary-light bg-opacity-20 p-3 rounded-full text-primary">
                    <FiMail className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Email Us</h3>
                    <p className="text-gray-600">
                      <a href="mailto:kavas.yoga@gmail.com" className="hover:text-primary">
                        kavas.yoga@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-3">Connect With Us</h3>
                <div className="flex space-x-4">
                  <a 
                    href="https://instagram.com/consciouscafe" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-primary-light bg-opacity-20 p-3 rounded-full text-primary hover:bg-primary hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <FiInstagram className="text-xl" />
                  </a>
                  <a 
                    href="https://facebook.com/consciouscafe" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-primary-light bg-opacity-20 p-3 rounded-full text-primary hover:bg-primary hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <FiFacebook className="text-xl" />
                  </a>
                </div>
              </div>
            </motion.div>
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-neutral-cream p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-serif mb-6">Send Us a Message</h2>
                <form className="space-y-6">
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
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Subject"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      id="message"
                      rows="5"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your Message"
                      required
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full btn btn-primary"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-neutral-cream">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-serif mb-4">Find Us</h2>
            <p className="max-w-2xl mx-auto text-gray-600 mb-8">
              We're located in the heart of Auroville, surrounded by lush greenery and peaceful vibes.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="rounded-lg overflow-hidden shadow-lg h-[400px]"
          >
            {/* In a real implementation, you would embed an actual Google Map here */}
            {/* For this example, using a placeholder with an iframe that would be replaced with actual map */}
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <p className="text-gray-600">
                Interactive Map Would Be Embedded Here<br />
                <span className="text-sm">(Google Maps iframe or similar)</span>
              </p>
              
              {/* Uncomment and replace with your actual Google Maps embed code 
              <iframe 
                src="https://www.google.com/maps/embed?pb=YOUR_EMBED_CODE_HERE"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Conscious Cafe Location"
              ></iframe>
              */}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reservations CTA */}
      <section className="py-16 bg-primary">
        <div className="container-custom">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Make a Reservation</h2>
            <p className="max-w-2xl mx-auto mb-8">
              Secure your table in advance for a special dining experience. We recommend reservations, 
              especially for weekends and larger groups.
            </p>
            <a href="/#reservation" className="btn bg-white text-primary hover:bg-neutral-cream">
              Reserve a Table
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
