import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGumletUrl } from '../../utils/gumlet';

const GUMLET_BASE = 'https://consciouscafe.gumlet.io/';
const gumletImg = (path, opts = {}) => getGumletUrl(path, opts);

const Arrow = ({ s = 16 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Reveal = ({ children, className = '', delay = 0, as: Tag = 'div', style }) => (
  <Tag style={style} className={`reveal${delay ? ` d${delay}` : ''} ${className}`}>{children}</Tag>
);

const STORY_IMG = 'images/Our Story page/Top photo on page.JPG';

const FOUNDERS = [
  { name: 'Kirtana', role: 'Co-founder', src: 'images/Our Story page/Kirtana headshot.jpg', local: false },
  { name: 'Zulfi', role: 'Co-founder', src: 'images/Our Story page/Zulfiqar Headshot.png', local: false },
  { name: 'Bhavninder', role: 'Co-founder', src: '/founder-bhavninder.png', local: true },
  { name: 'Pallavi', role: 'Co-founder', src: 'images/Our Story page/pallavi headshot.jpeg', local: false },
];

const VALUES = [
  { n: 'Mindfulness', p: 'Presence and intention in every plate, pour and pause — the practice that holds the rest together.' },
  { n: 'Sustainability', p: 'Sustainable food economics and eco-conscious habits, from sourcing along Auroville Road to a kitchen that wastes nothing.' },
  { n: 'Community', p: 'A welcoming, shared space built for connection, conversation and unhurried growth.' },
  { n: 'Natural living', p: 'The flavours of nature, celebrated through wholesome, plant-forward, conscious choices.' },
];

function Portrait({ src, alt, local, opts }) {
  const [err, setErr] = useState(false);
  const url = err ? null : (local ? src : gumletImg(src, opts));
  if (!url) return <div className="f-portrait-fallback" aria-label={alt}>{alt[0]}</div>;
  return <img src={url} alt={alt} loading="lazy" onError={() => setErr(true)} />;
}

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <main className="story-page">
      {/* Editorial hero */}
      <header className="story-hero">
        <div className="story-hero-head">
          <Reveal>
            <div className="kicker-row">
              <span className="idx">Our Story</span>
              <span className="eyebrow">Est. Auroville Road</span>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <h1 className="display">
              A love of food, yoga &amp; <em>community</em> — set one table.
            </h1>
          </Reveal>
          <Reveal delay={2}>
            <p className="lede">Connecting people with the flavours of nature, the discipline of yoga, and the quiet of mindfulness.</p>
          </Reveal>
        </div>
        <Reveal delay={2} className="story-hero-figure">
          <img
            src={gumletImg(STORY_IMG, { w: 1400, h: 1000, mode: 'crop', q: 86 })}
            alt="Our founders, in practice"
            loading="eager"
          />
        </Reveal>
      </header>

      {/* Mission passage */}
      <section className="section story-mission">
        <div className="sm-grid">
          <Reveal className="sm-aside">
            <span className="eyebrow">The vision</span>
            <span className="sm-rule" aria-hidden="true" />
          </Reveal>
          <div className="sm-body">
            <Reveal>
              <p className="sm-lead">
                A shared love for food, yoga, and community brought our founders — <em>Kirtana, Zulfi, Bhavninder</em> and <em>Pallavi</em> — together, around a single idea: a vibrant, healthy community built on wellness, sustainable food, and a place to belong.
              </p>
            </Reveal>
            <Reveal delay={1}>
              <p className="sm-para">
                We try to infuse mindfulness into every part of how we live and work — a foundation of presence and purpose. By keeping to it, we hope to slowly share that sense of balance with you, and to keep growing and learning together.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="section paper2">
        <div className="col-head">
          <Reveal>
            <div className="kicker-row">
              <span className="idx">The founders</span>
              <span className="eyebrow">Four people, one table</span>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="display" style={{ fontSize: 'clamp(32px,5vw,72px)', maxWidth: '15ch', marginBottom: 'clamp(36px,6vh,68px)' }}>
              The hands behind the <em>practice.</em>
            </h2>
          </Reveal>
        </div>
        <div className="founders">
          {FOUNDERS.map((f, i) => (
            <Reveal className="founder" delay={i + 1} key={f.name}>
              <div className="f-portrait">
                <Portrait src={f.src} alt={f.name} local={f.local} opts={{ w: 640, h: 800, mode: 'crop', q: 84 }} />
              </div>
              <h3>{f.name}</h3>
              <span className="f-role">{f.role}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Values (forest) */}
      <section className="section forest">
        <div className="col-head">
          <Reveal>
            <div className="kicker-row">
              <span className="idx" style={{ color: 'rgba(255,255,255,.55)' }}>What guides us</span>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="display" style={{ fontSize: 'clamp(32px,5vw,72px)', maxWidth: '16ch', marginBottom: 'clamp(40px,7vh,80px)' }}>
              Four principles we keep <em>returning to.</em>
            </h2>
          </Reveal>
        </div>
        <div className="pillars val-grid">
          {VALUES.map((v, i) => (
            <Reveal className="pillar" delay={i + 1} key={v.n}>
              <div className="pn">0{i + 1}</div>
              <h4>{v.n}</h4>
              <p>{v.p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Closing invitation */}
      <section className="section story-close">
        <Reveal>
          <span className="eyebrow">More than a meal</span>
          <h2 className="display" style={{ fontSize: 'clamp(34px,6vw,88px)', maxWidth: '16ch', margin: '20px auto 34px' }}>
            Come sit with us on <em>Auroville Road.</em>
          </h2>
        </Reveal>
        <Reveal delay={1} className="story-close-actions">
          <button className="btn forest" onClick={() => navigate('/menu')}>See the menu <Arrow /></button>
          <button className="tlink" onClick={() => navigate('/visit')}>Plan a visit <Arrow /></button>
        </Reveal>
      </section>
    </main>
  );
};

export default AboutUs;
