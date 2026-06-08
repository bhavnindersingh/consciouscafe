import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Arrow = ({ s = 16 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MAPS = 'https://maps.google.com/?q=Conscious+Cafe+Auroville+Road+Tamil+Nadu';

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="footer" id="visit">
      <div className="footer-top">
        <div>
          <span className="eyebrow on-dark" style={{ color: 'rgba(255,255,255,.55)' }}>Come sit a while</span>
          <h3 style={{ marginTop: 18 }}>Find us under<br /><em style={{ fontStyle: 'italic' }}>the canopy.</em></h3>
          <div style={{ marginTop: 30 }}>
            <button className="btn on-dark" onClick={() => navigate('/menu')}>
              Explore the Menu <Arrow />
            </button>
          </div>
        </div>

        <div>
          <div className="col-label">Visit</div>
          <p className="line">Kuilapalayam Main Road</p>
          <p className="line">Auroville Road, Tamil Nadu 605101</p>
          <p className="line" style={{ marginTop: 14 }}>Daily 9:30 — 21:00 · Closed Tuesday</p>
          <a href={MAPS} target="_blank" rel="noopener noreferrer" style={{ marginTop: 14 }}>Get directions →</a>
        </div>

        <div>
          <div className="col-label">Connect</div>
          <a href="https://www.instagram.com/consciouscafe.sanctuary/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="mailto:hello@consciouscafe.in">hello@consciouscafe.in</a>
          <a href="tel:+918754561269">+91 87545 61269</a>
          <div style={{ marginTop: 24 }}>
            <Link to="/privacy-policy" style={{ fontSize: 14, opacity: .6 }}>Privacy Policy</Link>
            {'  ·  '}
            <Link to="/terms-of-service" style={{ fontSize: 14, opacity: .6 }}>Terms</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Conscious Café · Auroville Road</span>
        <span>Plant-forward · Slow-made · Earth-first</span>
      </div>
    </footer>
  );
};

export default Footer;
