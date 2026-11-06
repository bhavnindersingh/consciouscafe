import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getGumletUrl } from '../../utils/gumlet';

// Decorative flower — served optimised (≈37 KB webp vs the 1 MB source PNG).
const HIBISCUS = getGumletUrl('hibiscus.png', { width: 760, quality: 72, format: 'auto' });

// Hero poster — paints immediately as the LCP element while the background
// video loads on top. Preloaded in index.html (URL must stay in sync).
const HERO_POSTER = getGumletUrl('images/hero-poster.jpg', { width: 1600, quality: 70, format: 'auto' });

const Arrow = ({ s = 16 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GUMLET_VIDEO = 'https://play.gumlet.io/embed/6925f88a3c99376d4fd48188?background=true&autoplay=true&loop=true&disableControls=true&muted=true&preload=true';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <header className="hero" id="home">
      <div className="hero-media">
        <img className="hero-poster" src={HERO_POSTER} alt="" aria-hidden="true" fetchpriority="high" decoding="async" />
        <div className="hero-video">
          <iframe
            title="Conscious Café"
            src={GUMLET_VIDEO}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="origin"
            loading="lazy"
          />
        </div>
      </div>
      <img className="hero-flower" src={HIBISCUS} alt="" aria-hidden="true" loading="lazy" decoding="async" style={{ position: 'absolute' }} />
      <div className="hero-side">Auroville Road · South India</div>
      <div className="scroll-cue"><span>scroll</span><span className="rail" /></div>
      <div className="hero-inner">
        <div style={{ maxWidth: 1500, margin: '0 auto', width: '100%' }}>
          <span className="eyebrow on-dark">Conscious Café &amp; Sanctuary</span>
          <h1 className="display reveal">A café and a sanctuary,<br /><em>one slow place.</em></h1>
          <p className="hero-sub">A plant-led kitchen on Auroville Road and, beside it, a place to move, sit still and restore — with classes and evenings on the calendar.</p>
          <div className="hero-cta">
            <button className="btn on-dark" onClick={() => navigate('/menu')}>View the Menu <Arrow /></button>
            <button className="btn on-dark" style={{ borderColor: 'transparent', paddingLeft: 0 }} onClick={() => navigate('/sanctuary')}>See what’s on <Arrow /></button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
