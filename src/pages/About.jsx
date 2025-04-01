import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiHeart, FiSun } from 'react-icons/fi';

// Placeholder images for the about page
const aboutHeroImage = "https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
const founderImage = "https://images.unsplash.com/photo-1540569876033-6e5d046a1d77?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=735&q=80";
const cafeInteriorImage = "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
const farmImage = "https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
const teamImage = "https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
const yogaImage = "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";

const About = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <img 
            src={aboutHeroImage} 
            alt="Conscious Cafe - Our Story" 
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4">Our Story</h1>
              <p className="text-xl mb-6">
                Connecting people with the flavors of nature, yoga & mindfulness
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-serif mb-6">Our Mission</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                At Conscious Cafe, we believe in the power of mindful living through nourishing food, 
                movement, and community. Our mission is to create a space where people can connect 
                with themselves, each other, and the earth through sustainably sourced cuisine and 
                mindful practices.
              </p>
              <div className="h-1 w-24 bg-primary mx-auto"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder's Story */}
      <section className="py-16 bg-neutral-cream">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 md:order-1"
            >
              <h2 className="text-3xl font-serif mb-4">The Founder's Journey</h2>
              <p className="text-gray-600 mb-4">
                Conscious Cafe was born from a passion for holistic living and a desire to create positive change in the world. 
                After years of traveling and studying various culinary traditions and yoga practices around the globe, our 
                founder returned to Auroville with a vision.
              </p>
              <p className="text-gray-600 mb-4">
                "I wanted to create a space where nourishing food, mindful movement, and community connection could coexist. 
                A place that honors the earth while delighting the senses."
              </p>
              <p className="text-gray-600 mb-6">
                What started as a small gathering space has blossomed into a beloved community hub that welcomes both locals 
                and visitors to experience conscious living through every bite and breath.
              </p>
              <p className="font-serif text-primary text-xl">
                - Kavita, Founder
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <img 
                src={founderImage} 
                alt="Conscious Cafe Founder" 
                className="rounded-lg shadow-lg h-auto max-w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-serif mb-4">Our Core Values</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              These principles guide everything we do, from sourcing ingredients to creating community experiences.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-neutral-cream rounded-lg p-8 shadow-md"
            >
              <div className="bg-primary-light bg-opacity-20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FiHeart className="text-2xl text-primary" />
              </div>
              <h3 className="text-xl font-serif mb-4">Mindful Living</h3>
              <p className="text-gray-600">
                We embrace presence in all we do—from mindfully preparing each dish to creating 
                spaces for contemplative practice and connection.
              </p>
            </motion.div>
            
            {/* Value 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-neutral-cream rounded-lg p-8 shadow-md"
            >
              <div className="bg-primary-light bg-opacity-20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FiSun className="text-2xl text-primary" />
              </div>
              <h3 className="text-xl font-serif mb-4">Sustainability</h3>
              <p className="text-gray-600">
                Our commitment to the planet guides our choices—from locally sourced ingredients 
                to eco-friendly practices throughout our operations.
              </p>
            </motion.div>
            
            {/* Value 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-neutral-cream rounded-lg p-8 shadow-md"
            >
              <div className="bg-primary-light bg-opacity-20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FiAward className="text-2xl text-primary" />
              </div>
              <h3 className="text-xl font-serif mb-4">Community</h3>
              <p className="text-gray-600">
                We foster meaningful connections and create a welcoming environment where everyone can 
                feel at home, share experiences, and grow together.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Space */}
      <section className="py-16 bg-neutral-cream">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-serif mb-4">Our Space</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              Conscious Cafe is designed to be a sanctuary for the senses—a place to nourish body and soul.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-lg overflow-hidden shadow-lg"
            >
              <img 
                src={cafeInteriorImage} 
                alt="Conscious Cafe Interior" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6 bg-white">
                <h3 className="text-xl font-serif mb-2">The Cafe</h3>
                <p className="text-gray-600">
                  Our dining area blends natural elements with comfort, creating a serene atmosphere 
                  perfect for savoring our mindfully crafted dishes.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="rounded-lg overflow-hidden shadow-lg"
            >
              <img 
                src={yogaImage} 
                alt="Kavas Yoga Shala" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6 bg-white">
                <h3 className="text-xl font-serif mb-2">Kavas Yoga Shala</h3>
                <p className="text-gray-600">
                  Our yoga studio provides a peaceful sanctuary for practice, with natural light, 
                  eco-friendly materials, and a calming atmosphere.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Farm to Table */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img 
                src={farmImage} 
                alt="Our Local Farm Partners" 
                className="rounded-lg shadow-lg"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-serif mb-4">Farm to Table</h2>
              <p className="text-gray-600 mb-4">
                We partner with local organic farms to bring the freshest ingredients to your plate. 
                Our menu changes with the seasons, reflecting what's growing in the community.
              </p>
              <p className="text-gray-600 mb-4">
                By sourcing locally, we not only ensure peak freshness and flavor but also reduce our 
                carbon footprint and support the local economy.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center text-white text-xs mr-3 mt-1">✓</span>
                  <span>90% of our ingredients come from within 50km of Auroville</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center text-white text-xs mr-3 mt-1">✓</span>
                  <span>We work directly with over 15 local farmers</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center text-white text-xs mr-3 mt-1">✓</span>
                  <span>All produce is organic or grown without chemicals</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-neutral-cream">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-serif mb-4">Meet Our Team</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              The heart and soul of Conscious Cafe is our dedicated team who share our values and passion.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <img 
              src={teamImage} 
              alt="Conscious Cafe Team" 
              className="w-full rounded-lg shadow-lg mb-8"
            />
            <p className="text-center text-gray-600 max-w-3xl mx-auto">
              Our diverse team brings together skills in culinary arts, yoga instruction, sustainable practices, 
              and community building. Together, we create an experience that nourishes on multiple levels.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-16 bg-primary">
        <div className="container-custom">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Join Our Community</h2>
            <p className="max-w-2xl mx-auto mb-8">
              Experience the Conscious Cafe difference. Visit us to enjoy mindful dining, join a yoga class, 
              or participate in one of our community events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="btn bg-white text-primary hover:bg-neutral-cream">
                Contact Us
              </a>
              <a href="/events" className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary">
                Upcoming Events
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
