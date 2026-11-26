import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getGumletUrl } from '../../utils/gumlet';
import SEO from '../../components/seo/SEO/SEO';
import { generatePageSEO, generateStructuredData, breadcrumb, FAQS, maps } from '../../utils/seoData';

const WHATSAPP_URL = 'https://wa.me/918754561269';
const INSTAGRAM_URL = 'https://www.instagram.com/consciouscafe.sanctuary/';


const Reveal = ({ children, className = '', delay = 0, as: Tag = 'div', style }) => (
  <Tag style={style} className={`reveal${delay ? ` d${delay}` : ''} ${className}`}>{children}</Tag>
);

const HERO_IMG = "images/menu-photos/food/Mezze Platter.JPG";

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
  const seo = generatePageSEO('visit');

  return (
    <main className="visit-view">
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        url={seo.url}
        structuredData={[
          generateStructuredData('restaurant'),
          generateStructuredData('faq'),
          breadcrumb([{ name: 'Home', path: '/' }, { name: 'Visit', path: '/visit' }]),
        ]}
      />
      <header className="visit-hero">
        <img
          src={getGumletUrl(HERO_IMG, { w: 1920, h: 1080, mode: 'crop', q: 88 })}
          alt="A table at Conscious Café"
          loading="eager"
        />
        <div className="visit-hero-inner">
          <div style={{ maxWidth: 1500, margin: '0 auto', width: '100%' }}>
            <h1 className="display reveal">Come sit<br />a while.</h1>
            <p className="hero-sub reveal">An open courtyard under the trees — slow mornings, long lunches, and a kitchen that never rushes you out.</p>
          </div>
        </div>
      </header>

      <section className="section visit-shell">
        <Reveal className="visit-info">
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

          <div className="contact-block" id="contact">
            <span className="visit-label">Reach us</span>
            <a href="mailto:hello@consciouscafe.in">hello@consciouscafe.in</a>
            <a href="tel:+918754561269">+91 87545 61269</a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">@consciouscafe.sanctuary</a>
          </div>

          <div className="visit-cta">
            <a className="btn forest" href={maps.directions} target="_blank" rel="noopener noreferrer">
              Get directions
            </a>
            <button className="btn" onClick={() => navigate('/menu')}>View the menu</button>
          </div>
        </Reveal>

        <Reveal delay={1} className="visit-map">
          <iframe
            title="Conscious Café location"
            src={maps.embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a className="map-open" href={maps.place} target="_blank" rel="noopener noreferrer">
            Open in Google Maps ↗
          </a>
        </Reveal>
      </section>

      <section className="section paper2 here-section">
        <Reveal><h2 className="sec-h">Getting here</h2></Reveal>
        <div className="here-grid">
          {NOTES.map((n, i) => (
            <Reveal className="here-card" delay={i + 1} key={n.k}>
                            <h4>{n.k}</h4>
              <p>{n.t}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section faq-section">
        <Reveal><h2 className="sec-h">Questions</h2></Reveal>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          {FAQS.map((f, i) => (
            <Reveal className="faq-item" delay={i + 1} key={f.q} style={{ padding: '22px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line-soft)' }}>
              <h3 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(20px,2.4vw,28px)', marginBottom: 8 }}>{f.q}</h3>
              <p style={{ fontFamily: 'var(--ui)', lineHeight: 1.6, color: 'var(--ink-mute)' }}>{f.a}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
};

export default VisitPage;
