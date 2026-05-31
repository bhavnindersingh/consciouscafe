import React, { startTransition } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-video-backdrop">
        <div className="gumlet-wrapper">
          <iframe
            title="Gumlet video player"
            src="https://play.gumlet.io/embed/6925f88a3c99376d4fd48188?background=true&autoplay=true&loop=true&disableControls=true&muted=true&preload=true"
            style={{
              border: 'none',
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '100%'
            }}
            referrerPolicy="origin"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          />
        </div>
      </div>
      <div className="hero-content">
        <h1>Conscious Cafe</h1>
        <div className="hero-buttons">
          <button className="cta-btn" onClick={() => startTransition(() => navigate('/menu'))}>
            View Menu
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
