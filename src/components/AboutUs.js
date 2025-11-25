import React from "react";
import SEO from "./SEO";
import { generatePageSEO, generateStructuredData } from "../utils/seoData";
import { getGumletUrl, gumletPresets } from "../utils/gumlet";

const AboutUs = () => {
  // Generate SEO data for about page
  const seoData = generatePageSEO('about', {
    structuredData: [
      generateStructuredData('restaurant'),
      generateStructuredData('breadcrumb', {
        items: [
          { name: 'Home', url: '/' },
          { name: 'About Us', url: '/about' },
        ]
      })
    ]
  });


  return (
    <div className="about-us-page">
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={seoData.url}
        structuredData={seoData.structuredData}
      />
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <h1>Our Story</h1>
            <p className="about-hero-subtitle">
              Connecting people with the flavors of nature, yoga & mindfulness
            </p>
          </div>
        </div>
      </section>

      {/* Main Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-content">
            <div className="story-image">
              <img
                src={getGumletUrl(
                  "images/Our Story page/Top photo on page.JPG",
                  gumletPresets.storyImage
                )}
                loading="eager"
                decoding="async"
                alt="Our founders practicing yoga and mindfulness"
              />
            </div>
            <div className="story-text">
              <p className="story-intro">
                A shared love for food, yoga, and community brought our founders—Kirtana, Zulfi,
                Bhavninder, and Pallavi—together. Their vision is to cultivate a vibrant, healthy
                community through a thoughtful blend of wellness practices, sustainable food economics,
                and a welcoming shared space.
              </p>
              <p className="story-mission">
                We aim to infuse mindfulness into every aspect of our lives and work, creating a
                foundation of presence and purpose. By embracing these principles, we hope to gradually
                share this sense of balance and mindfulness with you, fostering a deeper connection and
                inspiring a journey of continual growth and learning together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="founders-section">
        <div className="container">
          <h2>Meet Our Founders</h2>
          <div className="founders-grid">
            <div className="founder-card">
              <div className="founder-image">
                <img
                  src={getGumletUrl(
                    "images/Our Story page/Kirtana headshot.jpg",
                    gumletPresets.founder
                  )}
                  loading="lazy"
                  decoding="async"
                  alt="Kirtana"
                />
              </div>
              <h3>Kirtana</h3>
              <p>Co-Founder</p>
            </div>
            <div className="founder-card">
              <div className="founder-image">
                <img
                  src={getGumletUrl(
                    "images/Our Story page/Zulfiqar Headshot.png",
                    gumletPresets.founder
                  )}
                  loading="lazy"
                  decoding="async"
                  alt="Zulfi"
                />
              </div>
              <h3>Zulfi</h3>
              <p>Co-Founder</p>
            </div>
            <div className="founder-card">
              <div className="founder-image">
                <img
                  src={getGumletUrl(
                    "images/Our Story page/bhuvi headshot.png",
                    gumletPresets.founder
                  )}
                  loading="lazy"
                  decoding="async"
                  alt="Bhavninder"
                />
              </div>
              <h3>Bhavninder</h3>
              <p>Co-Founder</p>
            </div>
            <div className="founder-card">
              <div className="founder-image">
                <img
                  src={getGumletUrl(
                    "images/Our Story page/pallavi headshot.jpeg",
                    gumletPresets.founder
                  )}
                  loading="lazy"
                  decoding="async"
                  alt="Pallavi"
                />
              </div>
              <h3>Pallavi</h3>
              <p>Co-Founder</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🧘‍♀️</div>
              <h3>Mindfulness</h3>
              <p>Infusing presence and intention into every aspect of our cafe experience</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌱</div>
              <h3>Sustainability</h3>
              <p>Committed to sustainable food economics and eco-conscious practices</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Community</h3>
              <p>Creating a welcoming shared space for connection and growth</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🍃</div>
              <h3>Natural Living</h3>
              <p>Celebrating the flavors of nature through wholesome, conscious food choices</p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="experience-section">
        <div className="container">
          <div className="experience-content">
            <h2>The Conscious Experience</h2>
            <p>
              Join us for more than just a meal. Experience a journey of mindful eating,
              conscious living, and community connection. Every visit is an opportunity
              to nourish your body, calm your mind, and connect with like-minded souls.
            </p>
            <div className="experience-features">
              <div className="feature">
                <span className="feature-icon">🍽️</span>
                <span>Mindful Dining</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🧘‍♂️</span>
                <span>Yoga Sessions</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🌿</span>
                <span>Wellness Workshops</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🤲</span>
                <span>Community Events</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
