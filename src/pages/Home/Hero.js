import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Arrow = ({ s = 16 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GUMLET_VIDEO = 'https://play.gumlet.io/embed/6925f88a3c99376d4fd48188?background=true&autoplay=true&loop=true&disableControls=true&muted=true&preload=true';

const Hero = () => {
  const navigate = useNavigate();
  const [isPhone, setIsPhone] = useState(
    typeof window !== 'undefined' && window.matchMedia('(max-width:760px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width:760px)');
    const handler = () => setIsPhone(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const scrollToGather = () => {
    const el = document.getElementById('gather');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' });
  };

  return (
    <header className="hero" id="home">
      <div className="hero-media">
        <div className={`hero-video${isPhone ? '' : ''}`}>
          <iframe
            key={isPhone ? 'm' : 'd'}
            title="Conscious Café"
            src={GUMLET_VIDEO}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="origin"
          />
        </div>
      </div>
      <img className="hero-flower" src="/hibiscus.png" alt="" aria-hidden="true" />
      <div className="hero-side">Auroville Road · South India</div>
      <div className="scroll-cue"><span>scroll</span><span className="rail" /></div>
      <div className="hero-inner">
        <div style={{ maxWidth: 1500, margin: '0 auto', width: '100%' }}>
          <span className="eyebrow on-dark">Plant-forward kitchen · since 2016</span>
          <h1 className="display reveal">Eat like the<br /><em>earth is watching.</em></h1>
          <p className="hero-sub">A slow kitchen on Auroville Road — whole foods, plant-led plates, and gatherings that move at the speed of presence.</p>
          <div className="hero-cta">
            <button className="btn on-dark" onClick={() => navigate('/menu')}>View the Menu <Arrow /></button>
            <button className="btn on-dark" style={{ borderColor: 'transparent', paddingLeft: 0 }} onClick={scrollToGather}>Sanctuary →</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
