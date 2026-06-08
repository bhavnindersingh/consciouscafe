import React, { useMemo, useState } from 'react';
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

const catName = (slug = '') =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

/* Sanctuary waitlist / host enquiry modal */
const SANC_INTENTS = {
  waitlist: {
    flag: 'Opening 2026',
    title: 'Join the waitlist',
    sub: 'Be first through the doors when the shala, temple and ice spa open beside the café — with an early-access window before anyone else.',
    fields: ['name', 'email', 'interest'],
    submit: 'Join the waitlist',
    doneH: "You're on the list.",
    doneP: "We'll write to {email} the moment doors open.",
  },
  notify: {
    flag: 'Opening 2026',
    title: 'Notify me when it opens',
    sub: 'One quiet email when the Sanctuary is ready to receive you. Nothing else, ever.',
    fields: ['email'],
    submit: 'Notify me',
    doneH: 'Noted.',
    doneP: 'A single note will reach {email} the day the Sanctuary opens.',
  },
  host: {
    flag: 'Private & group bookings',
    title: 'Host at the Sanctuary',
    sub: 'Workshops, retreats, sound circles or private sessions — tell us what you have in mind and we\'ll shape the space around it.',
    fields: ['name', 'email', 'phone', 'type', 'dates', 'message'],
    submit: 'Send enquiry',
    doneH: 'Thank you.',
    doneP: "Your enquiry is with our team — we'll reply to {email} within two working days.",
  },
};

const INTEREST_OPTS = ['Yoga shala', 'Movement & gym', 'The temple', 'Ice spa', 'All of it'];
const HOST_TYPE_OPTS = ['Workshop', 'Retreat or residency', 'Sound & meditation circle', 'Private session', 'Corporate / team day', 'Something else'];

function SancField({ name, value, onChange }) {
  const set = v => onChange(name, v);
  if (name === 'name') return <label className="sa-field"><span>Your name</span><input type="text" value={value} onChange={e => set(e.target.value)} placeholder="First & last" /></label>;
  if (name === 'email') return <label className="sa-field"><span>Email</span><input type="email" value={value} onChange={e => set(e.target.value)} placeholder="you@email.com" /></label>;
  if (name === 'phone') return <label className="sa-field"><span>Phone <em>(optional)</em></span><input type="tel" value={value} onChange={e => set(e.target.value)} placeholder="+91" /></label>;
  if (name === 'dates') return <label className="sa-field"><span>Preferred dates <em>(optional)</em></span><input type="text" value={value} onChange={e => set(e.target.value)} placeholder="e.g. a weekend in March" /></label>;
  if (name === 'interest') return (
    <label className="sa-field"><span>What draws you</span>
      <select value={value} onChange={e => set(e.target.value)}>
        <option value="">Choose one…</option>
        {INTEREST_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
  if (name === 'type') return (
    <label className="sa-field"><span>Kind of gathering</span>
      <select value={value} onChange={e => set(e.target.value)}>
        <option value="">Choose one…</option>
        {HOST_TYPE_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
  if (name === 'message') return <label className="sa-field sa-wide"><span>Tell us more</span><textarea rows={3} value={value} onChange={e => set(e.target.value)} placeholder="Numbers, intention, anything we should know…" /></label>;
  return null;
}

function SanctuaryModal({ intent, onClose }) {
  const cfg = intent ? SANC_INTENTS[intent] : null;
  const [form, setForm] = useState({});
  const [sent, setSent] = useState(false);

  React.useEffect(() => { setForm({}); setSent(false); }, [intent]);
  React.useEffect(() => {
    if (!intent) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [intent, onClose]);

  if (!cfg) return null;

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const emailOk = /\S+@\S+\.\S+/.test(form.email || '');
  const canSend = emailOk && (!cfg.fields.includes('name') || (form.name || '').trim().length > 1);
  const onSubmit = e => { e.preventDefault(); if (canSend) setSent(true); };
  const isHost = intent === 'host';

  return (
    <div className="sa-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sa-panel" role="dialog" aria-modal="true" aria-label={cfg.title}>
        <button className="sa-close" onClick={onClose} aria-label="Close">×</button>
        {!sent ? (
          <>
            <span className="sa-flag"><span className="dot" />Conscious Sanctuary · {cfg.flag}</span>
            <h3 className="display">{cfg.title}</h3>
            <p className="sa-sub">{cfg.sub}</p>
            <form className="sa-form" onSubmit={onSubmit}>
              <div className={isHost ? 'sa-grid2' : ''}>
                {cfg.fields.map(f => <SancField key={f} name={f} value={form[f] || ''} onChange={setField} />)}
              </div>
              <button type="submit" className="btn forest sa-submit" disabled={!canSend}>{cfg.submit} <Arrow /></button>
              <p className="sa-fine">We use your details only for this — no lists sold, no noise.</p>
            </form>
          </>
        ) : (
          <div className="sa-done">
            <span className="sa-tick" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12.5l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <h3 className="display">{cfg.doneH}</h3>
            <p className="sa-sub">{cfg.doneP.replace('{email}', form.email || 'you')}</p>
            <button className="btn forest sa-submit" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* SIGNATURES — editorial product gallery */
function Signatures({ products, onProductClick }) {
  // Lead: first bestseller, or first product with an image
  const lead = useMemo(() => {
    if (!products.length) return null;
    return products.find(p => p.bestseller && p.image) || products.find(p => p.image) || products[0];
  }, [products]);

  // Trio: next 3 products from different categories than the lead
  const trio = useMemo(() => {
    if (!lead || products.length < 2) return [];
    const picks = [];
    const seen = new Set([lead.id]);
    for (const p of products) {
      if (!seen.has(p.id) && p.image && picks.length < 3) {
        seen.add(p.id);
        picks.push(p);
      }
    }
    return picks;
  }, [products, lead]);

  if (!lead) return null;

  return (
    <section className="section" id="signatures">
      <div className="col-head">
        <Reveal>
          <div className="kicker-row">
            <span className="idx">04 — Signatures</span>
            <span className="eyebrow">What the regulars order</span>
          </div>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="display" style={{ fontSize: 'clamp(32px,5vw,76px)', maxWidth: '15ch', marginBottom: 0 }}>
            Plates worth the trip to <em>Auroville Road.</em>
          </h2>
        </Reveal>
      </div>

      <div className="sig">
        <Reveal className="sig-lead">
          <div className="sig-figure" role="button" tabIndex={0} onClick={() => onProductClick(lead)}>
            <img src={lead.image} alt={lead.name} loading="lazy" />
            <span className="tag">{catName(lead.category)}</span>
          </div>
        </Reveal>
        <div className="sig-leadbody">
          <Reveal delay={1}>
            <span className="eyebrow">{catName(lead.category)}</span>
            <h3>{lead.name}</h3>
            <p>{lead.description}</p>
            <div className="sig-meta">
              <span className="price">₹{lead.price}</span>
            </div>
            <button className="tlink" onClick={() => onProductClick(lead)}>View dish <Arrow /></button>
          </Reveal>
        </div>
      </div>

      {trio.length > 0 && (
        <div className="sig-grid">
          {trio.map((p, i) => (
            <Reveal className="sig-card" delay={i + 1} key={p.id}>
              <div className="sig-figure" role="button" tabIndex={0} onClick={() => onProductClick(p)}>
                <img src={p.image} alt={p.name} loading="lazy" />
              </div>
              <div className="sc-body" onClick={() => onProductClick(p)}>
                <div>
                  <h4>{p.name}</h4>
                  <span className="sc-cat">{catName(p.category)}</span>
                </div>
                <span className="sc-price">₹{p.price}</span>
              </div>
            </Reveal>
          ))}
        </div>
      )}
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
    { n: 'Local sourcing', h: 'Grown within reach of our doors', p: 'Millets, roots and greens from farms from around Auroville. We cook the season, so the menu breathes with the year.' },
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
  const [intent, setIntent] = useState(null);
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
            <button className="btn on-dark" onClick={() => setIntent('waitlist')}>Join the waitlist <Arrow /></button>
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
            <button className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => setIntent('notify')}>
              Notify me when it opens <Arrow />
            </button>
          </Reveal>
        </div>

        <div className="host-banner">
          <div className="hb-copy">
            <span className="eyebrow">Private &amp; group bookings</span>
            <h4>Planning a workshop or retreat? Host it at the Sanctuary.</h4>
          </div>
          <button className="btn" onClick={() => setIntent('host')}>Host at the Sanctuary <Arrow /></button>
        </div>
      </div>

      <SanctuaryModal intent={intent} onClose={() => setIntent(null)} />
    </section>
  );
}

const ProductGrid = ({ products = [], onAddToCart, onProductClick }) => {
  const navigate = useNavigate();

  /* Food products only for the signature section */
  const foodProducts = useMemo(() =>
    products.filter(p => !p.mainCategory || p.mainCategory === 'food'),
    [products]
  );

  return (
    <>
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

      <section style={{ background: 'var(--paper)' }}>
        <Signatures products={foodProducts} onProductClick={onProductClick} />
      </section>

      <Pillars />
      <Gatherings />
    </>
  );
};

export default ProductGrid;
