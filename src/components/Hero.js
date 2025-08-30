import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // Enhanced Sirv initialization for Netlify
    const initSirv = () => {
      if (window.Sirv) {
        try {
          window.Sirv.start();
        } catch (error) {
          console.warn('Sirv initialization failed:', error);
        }
      }
    };

    // Initialize immediately if Sirv is available
    if (window.Sirv) {
      initSirv();
    } else {
      // Wait for Sirv to load
      const checkSirv = setInterval(() => {
        if (window.Sirv) {
          initSirv();
          clearInterval(checkSirv);
        }
      }, 100);
      
      // Clear interval after 5 seconds
      setTimeout(() => clearInterval(checkSirv), 5000);
    }
  }, []);

  return (
    <section className="hero">
      <div className="hero-video-backdrop">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="metadata"
          onError={() => setVideoError(true)}
          style={{ display: videoError ? 'none' : 'block' }}
        >
          <source src="https://consciouscafe.sirv.com/CCOpenshotvideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {videoError && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #f4f2f0 0%, #ffffff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/android-icon-192x192.png" 
              alt="Conscious Cafe" 
              style={{ opacity: 0.1, maxWidth: '200px' }}
            />
          </div>
        )}
      </div>
      
      <div className="hero-video-overlay"></div>

      <div className="container">
        <div className="hero-content">
          <h1>Conscious Cafe</h1>
          <div className="hero-buttons">
            <button className="cta-btn" onClick={() => navigate('/menu')}>
              View Food Menu
            </button>
            <button className="cta-btn" onClick={() => navigate('/drinks')}>
              View Drinks Menu
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;