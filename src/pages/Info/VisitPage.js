import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getGumletUrl } from '../../utils/gumlet';

const MAPS_URL = 'https://maps.google.com/?q=Conscious+Cafe+Auroville';

const Arrow = ({ s = 16 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Reveal = ({ children, className = '', delay = 0, as: Tag = 'div', style }) => (
  <Tag style={style} className={`reveal${delay ? ` d${delay}` : ''} ${className}`}>{children}</Tag>
);

const HERO_IMG = "images/Food Menu Conscious Cafe August'25/PLATTERS/Mezze platter/Mezze Platter.JPG";

const HOURS = [
  { d: 'Mon, Wed — Sun', h: '9:30 — 21:00' },
  { d: 'Tuesday', h: 'Closed' },
];

const NOTES = [
  { k: 'The landmark', t: 'On Auroville Road, a few minutes from the Visitor Centre. Look for the canopy of trees and the open courtyard.' },
  { k: 'Getting here', t: 'Easiest by two-wheeler or car from Pondicherry (~20 min). Auto-rickshaws know it by name. Cycle parking at the gate.' },
  { k: 'Before you come', t: 'Walk-ins are welcome. For long tables and larger groups, a quick message ahead helps us hold the right space.' },
];

const VisitPage = () => {
  const navigate = useNavigate();

  return (
    <main className="visit-view">
      <header className="visit-hero">
        <img
          src={getGumletUrl(HERO_IMG, { w: 1920, h: 1080, mode: 'crop', q: 88 })}
          alt="A table at Conscious Café"
          loading="eager"
        />
        <div className="visit-hero-inner">
          <div style={{ maxWidth: 1500, margin: '0 auto', width: '100%' }}>
            <span className="eyebrow on-dark reveal">Visit · Auroville Road</span>
            <h1 className="display reveal">Come sit<br /><em>a while.</em></h1>
            <p className="hero-sub reveal">An open courtyard under the trees — slow mornings, long lunches, and a kitchen that never rushes you out.</p>
          </div>
        </div>
      </header>

      <section className="section visit-shell">
        <Reveal className="visit-info">
          <span className="eyebrow">The café</span>
          <h2 className="visit-name">Conscious Café</h2>
          <p className="visit-addr">
            Kuilapalayam Main Road<br />
            Auroville Road, Tamil Nadu 605101
          </p>

          <div className="hours-block">
            <span className="visit-label">Hours</span>
            {HOURS.map(r => (
              <div className="hours-row" key={r.d}>
                <span>{r.d}</span>
                <span className="dots" />
                <span>{r.h}</span>
              </div>
            ))}
          </div>

          <div className="contact-block">
            <span className="visit-label">Reach us</span>
            <a href="mailto:hello@consciouscafe.in">hello@consciouscafe.in</a>
            <a href="tel:+918754561269">+91 87545 61269</a>
          </div>

          <div className="visit-cta">
            <a className="btn forest" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
              Get directions <Arrow />
            </a>
            <button className="btn" onClick={() => navigate('/menu')}>View the menu <Arrow /></button>
          </div>
        </Reveal>

        <Reveal delay={1} className="visit-map">
          <iframe
            title="Conscious Café location"
            src="https://www.google.com/maps?q=Conscious%20Cafe%20Auroville&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a className="map-open" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
            Open in Google Maps ↗
          </a>
        </Reveal>
      </section>

      <section className="section paper2 here-section">
        <Reveal>
          <div className="kicker-row">
            <span className="idx">Getting here</span>
            <span className="eyebrow">A few notes</span>
          </div>
        </Reveal>
        <div className="here-grid">
          {NOTES.map((n, i) => (
            <Reveal className="here-card" delay={i + 1} key={n.k}>
              <div className="pn">0{i + 1}</div>
              <h4>{n.k}</h4>
              <p>{n.t}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
};

export default VisitPage;
