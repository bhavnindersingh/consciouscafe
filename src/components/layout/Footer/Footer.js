import React from 'react';
import { Link } from 'react-router-dom';

const Arrow = ({ s = 16 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Printer = ({ s = 15 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="7" rx="1" />
  </svg>
);

const MAPS = 'https://maps.google.com/?q=Conscious+Cafe+Auroville+Road+Tamil+Nadu';

const Footer = () => {
  return (
    <footer className="footer" id="visit">
      <div className="footer-top">
        <div>
          <span className="eyebrow on-dark" style={{ color: 'rgba(255,255,255,.55)' }}>Come sit a while</span>
          <h3 style={{ marginTop: 18 }}>Find us under<br /><em style={{ fontStyle: 'italic' }}>the canopy.</em></h3>
          <div style={{ marginTop: 30 }}>
            <Link className="btn on-dark" to="/menu" style={{ display: 'inline-flex', fontSize: 12, marginBottom: 0 }}>
              Explore the Menu <Arrow />
            </Link>
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

        <div>
          <div className="col-label">Menu</div>
          {[
            { id: 'food', label: 'Food' },
            { id: 'drinks', label: 'Drinks' },
            { id: 'patisserie', label: 'Patisserie' },
          ].map(({ id, label }) => (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link to={`/menu/${id}`} style={{ margin: 0 }}>{label}</Link>
              <Link
                to={`/print-menu?focus=${id}`}
                title={`Print ${label} menu (PDF)`}
                aria-label={`Print ${label} menu`}
                style={{ display: 'inline-flex', margin: 0, color: 'rgba(255,255,255,.45)' }}
              >
                <Printer s={13} />
              </Link>
            </div>
          ))}
          <Link to="/menu" style={{ marginTop: 10, opacity: .6, fontSize: 14 }}>Full menu →</Link>
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
