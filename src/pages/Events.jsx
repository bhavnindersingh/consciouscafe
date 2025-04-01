import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiClock, FiUser } from 'react-icons/fi';

// Placeholder event images
const yogaImage = "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
const workshopImage = "https://images.unsplash.com/photo-1564939558297-fc396f18e5c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80";
const communityDinnerImage = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80";

// Sample event data
const upcomingEvents = [
  {
    id: 1,
    title: 'FIND YOUR CALM',
    type: 'Yoga Class',
    date: 'November 16, 2024',
    time: '10:30 AM - 12:30 PM',
    location: 'Kavas Yoga Shala, Conscious Cafe',
    description: 'A gentle yoga session focused on finding inner peace through mindful movement and breathing techniques. Suitable for all levels.',
    image: yogaImage,
    instructor: 'Maya Patel',
    price: '₹500',
    spots: 12
  },
  {
    id: 2,
    title: 'FARM TO TABLE COOKING',
    type: 'Workshop',
    date: 'November 22, 2024',
    time: '4:00 PM - 6:30 PM',
    location: 'Conscious Cafe Kitchen',
    description: 'Learn how to prepare delicious, healthy meals using locally sourced ingredients. This hands-on workshop includes dinner.',
    image: workshopImage,
    instructor: 'Chef Arun',
    price: '₹1200',
    spots: 8
  },
  {
    id: 3,
    title: 'COMMUNITY DINNER',
    type: 'Social Gathering',
    date: 'November 30, 2024',
    time: '7:00 PM - 10:00 PM',
    location: 'Conscious Cafe Garden',
    description: 'Join our monthly community dinner where we share food, stories, and build connections. Bring a dish to share if you wish!',
    image: communityDinnerImage,
    instructor: 'Hosted by Conscious Cafe Team',
    price: '₹400 (or bring a dish)',
    spots: 30
  }
];

const Events = () => {
  return (
    <div className="pt-16">
      {/* Events Hero */}
      <section className="bg-primary py-16 md:py-24">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4">Events & Classes</h1>
            <p className="text-lg mb-8">
              Join our community gatherings, workshops, and yoga classes. Connect, learn, and grow with us in a supportive environment.
            </p>
            <a href="#calendar" className="btn bg-white text-primary hover:bg-neutral-cream">
              View Calendar
            </a>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-serif mb-4">Upcoming Events</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join us for these enriching experiences. Pre-registration is recommended as spaces are limited.
            </p>
          </motion.div>
          
          <div className="space-y-12">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-neutral-cream rounded-lg overflow-hidden shadow-lg"
              >
                <div className="grid md:grid-cols-2">
                  <div className="h-64 md:h-auto overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex items-center mb-4">
                      <span className="px-3 py-1 bg-primary-light text-white text-sm rounded-full">
                        {event.type}
                      </span>
                      <span className="ml-3 text-gray-500 text-sm flex items-center">
                        <FiCalendar className="mr-1" />
                        {event.date}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-serif mb-3">{event.title}</h3>
                    
                    <p className="text-gray-600 mb-4">
                      {event.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-start">
                        <FiClock className="mt-1 mr-2 text-primary" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-start">
                        <FiMapPin className="mt-1 mr-2 text-primary" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-start">
                        <FiUser className="mt-1 mr-2 text-primary" />
                        <span>{event.instructor}</span>
                      </div>
                      <div>
                        <span className="font-medium">{event.price}</span>
                        <span className="mx-2">•</span>
                        <span>{event.spots} spots available</span>
                      </div>
                    </div>
                    
                    <a 
                      href={`#register-${event.id}`} 
                      className="btn btn-primary"
                    >
                      Register Now
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Calendar */}
      <section id="calendar" className="py-16 bg-neutral-cream scroll-mt-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-serif mb-4">Event Calendar</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Plan your visit and don't miss out on our regular events and special gatherings.
            </p>
          </motion.div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {/* Calendar implementation would go here */}
            {/* For demonstration, adding a simple calendar placeholder */}
            <div className="grid grid-cols-7 gap-2 mb-6 text-center">
              <div className="font-medium text-gray-500">Sun</div>
              <div className="font-medium text-gray-500">Mon</div>
              <div className="font-medium text-gray-500">Tue</div>
              <div className="font-medium text-gray-500">Wed</div>
              <div className="font-medium text-gray-500">Thu</div>
              <div className="font-medium text-gray-500">Fri</div>
              <div className="font-medium text-gray-500">Sat</div>
              
              {[...Array(30)].map((_, i) => {
                const day = i + 1;
                const hasEvent = [16, 22, 30].includes(day);
                return (
                  <div 
                    key={i} 
                    className={`p-3 border rounded-lg ${
                      hasEvent 
                        ? 'bg-primary-light bg-opacity-20 border-primary-light cursor-pointer hover:bg-opacity-30' 
                        : 'border-gray-200'
                    }`}
                  >
                    <span>{day}</span>
                    {hasEvent && <div className="mt-1 w-2 h-2 mx-auto rounded-full bg-primary"></div>}
                  </div>
                );
              })}
            </div>
            
            <p className="text-center text-sm text-gray-500">
              Click on dates with events to view details. For the full schedule, 
              <a href="#upcoming-events" className="text-primary ml-1 hover:underline">
                view all upcoming events
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Event Space */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-serif mb-4">Kavas Yoga Shala</h2>
              <p className="text-gray-600 mb-6">
                Our peaceful yoga studio is dedicated to promoting mindfulness and well-being through various yoga practices and meditation sessions. The space is designed to create a serene atmosphere for your practice.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center text-white text-xs mr-3 mt-1">✓</span>
                  <span>Spacious practice area with natural lighting</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center text-white text-xs mr-3 mt-1">✓</span>
                  <span>Eco-friendly props and equipment</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center text-white text-xs mr-3 mt-1">✓</span>
                  <span>Regular classes for all experience levels</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center text-white text-xs mr-3 mt-1">✓</span>
                  <span>Available for private sessions and events</span>
                </li>
              </ul>
              <a href="#yoga-schedule" className="btn btn-primary">
                View Class Schedule
              </a>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img 
                src={yogaImage} 
                alt="Kavas Yoga Shala" 
                className="rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Host Your Event CTA */}
      <section className="py-16 bg-primary">
        <div className="container-custom">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Host Your Event With Us</h2>
            <p className="max-w-2xl mx-auto mb-8">
              Our versatile spaces are available for private events, workshops, and gatherings. We offer catering options featuring our wholesome menu.
            </p>
            <a href="#contact" className="btn bg-white text-primary hover:bg-neutral-cream">
              Inquire Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
