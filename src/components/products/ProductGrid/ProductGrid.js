import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../../../pages/Home/Hero';

const Arrow = ({ s = 16 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Reveal = ({ children, className = '', delay = 0, as: Tag = 'div', style }) => (
  <Tag style={style} className={`reveal${delay ? ` d${delay}` : ''} ${className}`}>{children}</Tag>
);

function imgUrl(src, { w, h, q = 86, mode } = {}) {
  if (!src) return '';
  try {
    const url = new URL(src);
    if (w) url.searchParams.set('w', w);
    if (h) url.searchParams.set('h', h);
    if (q !== undefined) url.searchParams.set('q', q);
    if (mode) url.searchParams.set('mode', mode);
    url.searchParams.set('fm', 'auto');
    return url.toString();
  } catch { return src; }
}

const catName = (slug = '') =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

const createSlug = (name = '') =>
  name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

/* One alternating feature row */
function FeatureRow({ product, flip, dark, index, onProductClick }) {
  return (
    <section className={`feature${flip ? ' flip' : ''}${dark ? ' dark' : ''}`}>
      <Reveal className="feature-media">
        <img
          src={imgUrl(product.image, { w: 1100, h: 1200, mode: 'crop' })}
          alt={product.name}
          loading="lazy"
        />
        <span className="tag">{catName(product.category)}</span>
      </Reveal>
      <div className="feature-body">
        <Reveal>
          <span className="eyebrow">{String(index).padStart(2, '0')} · {catName(product.category)}</span>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <div className="feature-meta">
            <span className="price">₹{product.price}</span>
          </div>
          <button className="tlink" onClick={() => onProductClick(product)}>View dish <Arrow /></button>
        </Reveal>
      </div>
    </section>
  );
}

function Strip() {
  const words = ['Whole foods', 'Slow mornings', 'Wood-fired', 'Garden greens', 'House ferments', 'Made by hand', 'Zero rush'];
  const row = [...words, ...words];
  return (
    <div className="strip" aria-hidden="true">
      <div className="strip-track">
        {row.map((w, i) => <span className="strip-item" key={i}>{w}</span>)}
      </div>
    </div>
  );
}

function Pillars() {
  const items = [
    { n: 'Plant-forward', h: 'Plates that begin with the garden', p: 'Vegetables lead, proteins follow. Vegan by default, never by compromise — flavour first, always.' },
    { n: 'Local sourcing', h: 'Grown within reach of our doors', p: 'Millets, roots and greens from farms along Auroville Road. We cook the season, so the menu breathes with the year.' },
    { n: 'Nothing wasted', h: 'A kitchen that closes its loops', p: 'Peels become stock, stems become pesto, ferments carry nothing to the bin. Restraint is the recipe.' },
  ];
  return (
    <section className="section forest" id="story">
      <div className="col-head">
        <Reveal><div className="kicker-row"><span className="idx" style={{ color: 'rgba(255,255,255,.55)' }}>02 — Why we exist</span></div></Reveal>
        <Reveal delay={1}>
          <h2 className="display" style={{ fontSize: 'clamp(32px,5vw,76px)', maxWidth: '16ch', marginBottom: 'clamp(40px,7vh,84px)' }}>
            Conscious is not a <em>flavour.</em> It is a practice.
          </h2>
        </Reveal>
      </div>
      <div className="pillars">
        {items.map((it, i) => (
          <Reveal className="pillar" delay={i + 1} key={it.n}>
            <div className="pn">0{i + 1}</div>
            <h4>{it.h}</h4>
            <p>{it.p}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Gatherings() {
  const navigate = useNavigate();
  const offerings = [
    { t: 'Yoga Shala', d: 'Daily mat practice, breath & meditation' },
    { t: 'Movement & Gym', d: 'Strength, mobility and conditioning classes' },
    { t: 'The Temple', d: 'A quiet room for stillness, sound & sit' },
    { t: 'Ice Spa', d: 'Cold plunge, contrast therapy & recovery' },
  ];
  return (
    <section className="section" id="gather">
      <div className="col-head">
        <Reveal><div className="kicker-row"><span className="idx">03 — Conscious Sanctuary</span><span className="eyebrow">In the making · opening 2026</span></div></Reveal>
        <Reveal delay={1}>
          <h2 className="display" style={{ fontSize: 'clamp(32px,5vw,76px)', maxWidth: '18ch', marginBottom: 'clamp(40px,6vh,72px)' }}>
            A shala, a temple, an ice spa — <em>taking shape</em> beside the café.
          </h2>
        </Reveal>
      </div>
      <div className="gather-grid">
        <Reveal className="sanctuary-card">
          <span className="soon-flag">Coming soon</span>
          <span className="eyebrow">A space for body &amp; spirit</span>
          <h4>Conscious Sanctuary</h4>
          <p>Next door to the kitchen, we are building a place to move and to rest — a yoga shala, strength and movement classes, a temple to sit in, and a cold-water ice spa. Made slowly, the way everything here is.</p>
          <div style={{ marginTop: 24 }}>
            <button className="btn on-dark" onClick={() => navigate('/request-facilitator-access')}>Join the waitlist <Arrow /></button>
          </div>
        </Reveal>
        <div className="gather-stack">
          {offerings.map((o, i) => (
            <Reveal className="gather-mini" delay={i + 1} key={o.t}>
              <div className="gm-num">{String(i + 1).padStart(2, '0')}</div>
              <div><h5>{o.t}</h5><span className="gm-desc">{o.d}</span></div>
              <span className="soon-pill">Soon</span>
            </Reveal>
          ))}
          <Reveal delay={3}>
            <button className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => navigate('/request-facilitator-access')}>
              Notify me when it opens <Arrow />
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const ProductGrid = ({ products = [], onAddToCart, onProductClick }) => {
  const navigate = useNavigate();

  /* Pick 4 feature products: first item from each of 4 distinct categories */
  const features = useMemo(() => {
    if (!products.length) return [];
    const seen = new Set();
    const picks = [];
    for (const p of products) {
      if (!seen.has(p.category) && p.image) {
        seen.add(p.category);
        picks.push(p);
        if (picks.length === 4) break;
      }
    }
    return picks.length ? picks : products.slice(0, 4);
  }, [products]);

  return (
    <main>
      <Hero />

      {/* Manifesto */}
      <section className="section" id="manifesto">
        <div className="manifesto">
          <Reveal>
            <div className="kicker-row"><span className="idx">01 — Ethos</span><span className="eyebrow">A way of cooking</span></div>
          </Reveal>
          <Reveal delay={1}>
            <p className="display" style={{ fontSize: 'clamp(30px,5vw,78px)' }}>
              We cook with what the season offers — <span className="mut" style={{ color: 'var(--ink-mute)' }}>grains, roots, leaf and ferment</span> — and let restraint do the seasoning. Nothing rushed, nothing wasted, <em>everything considered.</em>
            </p>
          </Reveal>
          <div className="manifesto-foot">
            <Reveal delay={2}><p className="lede" style={{ maxWidth: '30ch' }}>Sourced within reach of our doors, prepared by hands that know the difference.</p></Reveal>
            <Reveal delay={3}><button className="tlink" onClick={() => navigate('/about')}>Read our story <Arrow /></button></Reveal>
          </div>
        </div>
      </section>

      <Strip />

      {/* 4 featured dishes */}
      {features.length > 0 && (
        <section style={{ background: 'var(--paper)' }}>
          {features.map((p, i) => (
            <FeatureRow
              key={p.id}
              product={p}
              flip={i % 2 === 1}
              dark={i === 2}
              index={i + 1}
              onProductClick={onProductClick}
            />
          ))}
        </section>
      )}

      <Pillars />
      <Gatherings />
    </main>
  );
};

export default ProductGrid;
