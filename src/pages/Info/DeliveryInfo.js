import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getGumletUrl } from '../../utils/gumlet';
import SEO from '../../components/seo/SEO/SEO';
import { generatePageSEO, generateStructuredData, breadcrumb, siteConfig } from '../../utils/seoData';

// Our own shoots — the curated menu photography, served through Gumlet. This
// page previously used two Unsplash stock shots of somebody else's food.
const HERO_IMG = 'images/menu-photos/food/Mezze Kodo Bowl.JPG';
const PANEL_IMG = 'images/menu-photos/food/Goodness Bowl.JPG';

const WHATSAPP_URL = 'https://wa.me/918754561269';

const Arrow = ({ s = 16 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Reveal = ({ children, className = '', delay = 0, as: Tag = 'div', style }) => (
  <Tag style={style} className={`reveal${delay ? ` d${delay}` : ''} ${className}`}>{children}</Tag>
);

const AREAS = [
  { d: 'Auroville', h: 'All communities' },
  { d: 'Kuilapalayam', h: 'And nearby roads' },
  { d: 'Pondicherry', h: 'French Quarter & city' },
  { d: 'Further out', h: 'Ask us' },
];

const HOURS = [
  { d: 'Mon, Wed — Sun', h: '9:30 — 21:00' },
  { d: 'Tuesday', h: 'Closed' },
];

const STEPS = [
  { k: 'Build your bag', t: 'Browse the menu and add what you want. Prices and dietary labels are live from our kitchen, so what you see is what we are cooking today.' },
  { k: 'Send it over', t: 'Checkout opens WhatsApp with your order, address and any notes already written out. Send the message — or just call us instead.' },
  { k: 'We confirm', t: 'We reply with the total and a time. Payment is on delivery: cash, card, UPI or a wallet, whichever is easiest.' },
  { k: 'Eat well', t: 'Food leaves the pass hot and packed to travel, usually within 30 to 45 minutes depending on how far you are.' },
];

const NOTES = [
  { k: 'Packed to travel', t: 'Biodegradable containers, no single-use plastic, and dishes chosen so they arrive the way they left the kitchen.' },
  { k: 'Cooked to order', t: 'Nothing sits under a lamp waiting for a driver. Bread, sauces and ferments are made in-house, the same as they are in the courtyard.' },
  { k: 'Minimums & fees', t: 'These depend on distance. Message us before you order if you are further out and we will tell you exactly where you stand.' },
];

const DeliveryInfo = () => {
  const navigate = useNavigate();
  const seo = generatePageSEO('delivery');

  return (
    <main className="visit-view">
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        url={seo.url}
        structuredData={[
          generateStructuredData('restaurant'),
          breadcrumb([{ name: 'Home', path: '/' }, { name: 'Delivery', path: '/delivery' }]),
        ]}
      />

      <header className="visit-hero">
        <img
          src={getGumletUrl(HERO_IMG, { w: 1920, h: 1080, mode: 'crop', q: 88 })}
          alt="A Mezze Kodo Bowl from the Conscious Café kitchen"
          loading="eager"
        />
        <div className="visit-hero-inner">
          <div style={{ maxWidth: 1500, margin: '0 auto', width: '100%' }}>
            <span className="eyebrow on-dark reveal">Delivery · Auroville Road</span>
            <h1 className="display reveal">Conscious food,<br /><em>delivered.</em></h1>
            <p className="hero-sub reveal">The same kitchen, the same sourcing — packed to travel across Auroville, Kuilapalayam and into Pondicherry.</p>
          </div>
        </div>
      </header>

      <section className="section visit-shell">
        <Reveal className="visit-info">
          <span className="eyebrow">Where we deliver</span>
          <h2 className="visit-name">Across Auroville,<br />and a little beyond.</h2>

          <div className="hours-block">
            <span className="visit-label">Areas</span>
            {AREAS.map(r => (
              <div className="hours-row" key={r.d}>
                <span>{r.d}</span>
                <span className="dots" />
                <span>{r.h}</span>
              </div>
            ))}
          </div>

          <div className="hours-block">
            <span className="visit-label">Delivery hours</span>
            {HOURS.map(r => (
              <div className="hours-row" key={r.d}>
                <span>{r.d}</span>
                <span className="dots" />
                <span>{r.h}</span>
              </div>
            ))}
          </div>

          <div className="contact-block">
            <span className="visit-label">Order by phone</span>
            <a href={`tel:${siteConfig.business.phone.replace(/\s/g, '')}`}>{siteConfig.business.phone}</a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
          </div>

          <div className="visit-cta">
            <button className="btn forest" onClick={() => navigate('/menu/food')}>Order food <Arrow /></button>
            <button className="btn" onClick={() => navigate('/menu/drinks')}>Browse drinks <Arrow /></button>
          </div>
        </Reveal>

        {/* Same framed panel the visit page gives its map — filled with a photo. */}
        <Reveal delay={1} className="visit-map">
          <img
            src={getGumletUrl(PANEL_IMG, { w: 1200, h: 1200, mode: 'crop', q: 86 })}
            alt="A Goodness Bowl, packed the same way it leaves the kitchen"
            loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Reveal>
      </section>

      <section className="section forest">
        <div className="col-head">
          <Reveal>
            <div className="kicker-row">
              <span className="idx" style={{ color: 'rgba(255,255,255,.55)' }}>How it works</span>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="display" style={{ fontSize: 'clamp(32px,5vw,72px)', maxWidth: '16ch', marginBottom: 'clamp(40px,7vh,80px)' }}>
              From your table to <em>your table.</em>
            </h2>
          </Reveal>
        </div>
        <div className="pillars val-grid">
          {STEPS.map((s, i) => (
            <Reveal className="pillar" delay={i + 1} key={s.k}>
              <div className="pn">0{i + 1}</div>
              <h4>{s.k}</h4>
              <p>{s.t}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section paper2 here-section">
        <Reveal>
          <div className="kicker-row">
            <span className="idx">Good to know</span>
            <span className="eyebrow">Before you order</span>
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

      <section className="section story-close">
        <Reveal>
          <span className="eyebrow">Hungry now</span>
          <h2 className="display" style={{ fontSize: 'clamp(34px,6vw,88px)', maxWidth: '16ch', margin: '20px auto 34px' }}>
            Start with the <em>menu.</em>
          </h2>
        </Reveal>
        <Reveal delay={1} className="story-close-actions">
          <button className="btn forest" onClick={() => navigate('/menu')}>See the full menu <Arrow /></button>
          <button className="tlink" onClick={() => navigate('/visit')}>Rather visit us? <Arrow /></button>
        </Reveal>
      </section>
    </main>
  );
};

export default DeliveryInfo;
