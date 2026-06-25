import React from 'react';
import { Link } from 'react-router-dom';
import LANDING_PAGES from '../../../data/landingPages.json';

const shortLabel = (slug) =>
  slug.replace(/-auroville$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

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
        <div className="ft-brand">
          <span className="eyebrow on-dark ft-eyebrow">Come sit a while</span>
          <h3 className="ft-statement">Find us under<br /><em>the canopy.</em></h3>
          <Link className="btn on-dark ft-cta" to="/menu">
            Explore the Menu <Arrow />
          </Link>
        </div>

        <div className="ft-col">
          <div className="col-label">Visit</div>
          <p className="line">Kuilapalayam Main Road</p>
          <p className="line">Auroville Road, Tamil Nadu 605101</p>
          <p className="line ft-hours">Daily 9:30 — 21:00 · Closed Tuesday</p>
          <a className="ft-arrow" href={MAPS} target="_blank" rel="noopener noreferrer">Get directions →</a>
        </div>

        <div className="ft-col">
          <div className="col-label">Connect</div>
          <a href="https://www.instagram.com/consciouscafe.sanctuary/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="mailto:hello@consciouscafe.in">hello@consciouscafe.in</a>
          <a href="tel:+918754561269">+91 87545 61269</a>
        </div>

        <div className="ft-col">
          <div className="col-label">Menu</div>
          {[
            { id: 'food', label: 'Food' },
            { id: 'drinks', label: 'Drinks' },
            { id: 'patisserie', label: 'Patisserie' },
          ].map(({ id, label }) => (
            <div key={id} className="ft-menu-row">
              <Link className="ft-menu-link" to={`/menu/${id}`}>{label}</Link>
              <Link
                className="ft-print"
                to={`/print-menu?focus=${id}`}
                title={`Print ${label} menu (PDF)`}
                aria-label={`Print ${label} menu`}
              >
                <Printer s={13} />
              </Link>
            </div>
          ))}
          <Link className="ft-arrow" to="/menu">Full menu →</Link>
        </div>
      </div>

      <div className="footer-explore">
        <div className="col-label">Explore</div>
        <div className="ft-explore-tags">
          {LANDING_PAGES.map(p => (
            <Link key={p.slug} className="ft-tag" to={`/${p.slug}`}>
              {shortLabel(p.slug)}
            </Link>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <span className="ft-copy">© 2026 Conscious Café · Auroville Road</span>
        <nav className="ft-legal" aria-label="Legal">
          <Link to="/privacy-policy">Privacy</Link>
          <span aria-hidden="true">·</span>
          <Link to="/terms-of-service">Terms</Link>
        </nav>
        <span className="ft-tagline">Plant-forward · Slow-made · Earth-first</span>
      </div>
    </footer>
  );
};

export default Footer;
