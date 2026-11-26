import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../../../pages/Home/Hero';
import NextGatherings from '../../../pages/Home/NextGatherings';
import SEO from '../../seo/SEO/SEO';
import { pageData, generateStructuredData, siteConfig } from '../../../utils/seoData';
import PhotoPending from '../../common/PhotoPending/PhotoPending';
import Kolam from '../../common/Kolam/Kolam';

const Reveal = ({ children, className = '', delay = 0, as: Tag = 'div', style }) => (
  <Tag style={style} className={`reveal${delay ? ` d${delay}` : ''} ${className}`}>{children}</Tag>
);

const catName = (slug = '') =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

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
          <h2 className="display" style={{ fontSize: 'clamp(36px,5vw,76px)', maxWidth: '15ch', marginBottom: 0 }}>
            Plates worth the trip to Auroville Road
          </h2>
          <p className="sig-sub">What the regulars order.</p>
        </Reveal>
      </div>

      <div className="sig">
        <Reveal className="sig-lead">
          <div className="sig-figure" role="button" tabIndex={0} onClick={() => onProductClick(lead)}>
            {/* Lead figure renders ~660px wide — on a high-DPI 27" display the
                900px `image` looks soft, so use the 1800px `imageDetail` here.
                The smaller trio/menu cards stay on `image` to avoid bloat. */}
            <img src={lead.imageDetail || lead.image} alt={lead.name} loading="lazy" />
            <PhotoPending hasPhoto={lead.hasLocalImage} className="photo-pending--lg" />
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
            <button className="tlink" onClick={() => onProductClick(lead)}>See the dish</button>
          </Reveal>
        </div>
      </div>

      {trio.length > 0 && (
        <div className="sig-grid">
          {trio.map((p, i) => (
            <Reveal className="sig-card" delay={i + 1} key={p.id}>
              <div className="sig-figure" role="button" tabIndex={0} onClick={() => onProductClick(p)}>
                <img src={p.image} alt={p.name} loading="lazy" />
                <PhotoPending hasPhoto={p.hasLocalImage} />
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

/* THE PRACTICE — the page's one bold moment: a sikku kolam on red oxide, the
   way it is drawn at a Tamil doorstep each morning — one line round every dot,
   closing where it began. The kitchen's three habits sit under it. */
function Practice() {
  const items = [
    { h: 'Plates that begin with the garden', p: 'Vegetables lead, proteins follow. Vegan by default, never by compromise — flavour first, always.' },
    { h: 'Grown within reach of our doors', p: 'Millets, roots and greens from farms around Auroville. We cook the season, so the menu changes with the year.' },
    { h: 'A kitchen that closes its loops', p: 'Peels become stock, stems become pesto, ferments carry nothing to the bin. Restraint is the recipe.' },
  ];
  return (
    <section className="section practice" id="story" aria-labelledby="practice-h">
      <div className="col-head practice-grid">
        <div className="practice-copy">
          <Reveal as="h2" className="display practice-h"><span id="practice-h">Conscious is not a flavour. It is a practice.</span></Reveal>
          <p className="practice-note">
            Like the kolam drawn at a Tamil doorstep each morning: one line, round every dot, closing where it began.
          </p>
        </div>
        <Kolam className="practice-kolam" cols={5} rows={3} />
      </div>
      <ul className="col-head practice-list">
        {items.map((it) => (
          <li key={it.h}>
            <h3>{it.h}</h3>
            <p>{it.p}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* THE PLACE — the spine of the page: one place, five ways to be well.
   The café is one strand; the rooms are open (owner, 2026-11-06); the
   Sanctuary's calendar is live. */
const STRANDS = [
  { verb: 'Nourish', name: 'The café', desc: 'Whole foods and plant-led plates, wood-fired and made by hand, from a kitchen that cooks the season.', status: 'Since 2021', link: { to: '/menu', label: 'View the menu' } },
  { verb: 'Move', name: 'Yoga shala & gym', desc: 'Mat practice, breath and meditation; strength, mobility and conditioning.', status: 'Open' },
  { verb: 'Be still', name: 'The temple', desc: 'A quiet room for stillness, sound and sitting.', status: 'Open' },
  { verb: 'Restore', name: 'Ice bath & Ayurvedic sauna', desc: 'Cold plunge, Ayurvedic sauna and the contrast between them.', status: 'Open', link: { to: '/sanctuary/restore', label: 'Book a slot' } },
  { verb: 'Gather', name: 'Classes, workshops & evenings', desc: 'Led by teachers and makers we trust. Reserve a place; pay at the door.', status: 'On the calendar', link: { to: '/sanctuary', label: 'See what’s on' } },
];

function Place() {
  const navigate = useNavigate();
  return (
    <section className="section home-place" id="place">
      <div className="col-head">
        <div className="home-place-head">
          <Reveal as="h2" className="display home-place-h">
            One place, several ways to be well
          </Reveal>
          <Reveal delay={2} as="p" className="lede home-place-lede">
            Food is one of them. Beside the kitchen are a yoga shala and gym, a temple, an ice bath and an Ayurvedic sauna — and classes, workshops and evenings gather here.
          </Reveal>
        </div>

        <ol className="home-strands">
          {STRANDS.map((st, i) => (
            <Reveal as="li" className="home-strand" delay={Math.min(i + 1, 4)} key={st.verb}>
              <span className="home-strand-verb">{st.verb}</span>
              <span className="home-strand-body">
                <span className="home-strand-name">{st.name}</span>
                <span className="home-strand-desc">{st.desc}</span>
              </span>
              <span className="home-strand-side">
                <span className="home-strand-status">{st.status}</span>
                {st.link && (
                  <button className="tlink home-strand-link" onClick={() => navigate(st.link.to)}>{st.link.label}</button>
                )}
              </span>
            </Reveal>
          ))}
        </ol>

        <div className="home-place-live">
          <NextGatherings />
        </div>
      </div>
    </section>
  );
}

/* THE CAFÉ — the kitchen's own section, one strand of the place. */
function Cafe() {
  const navigate = useNavigate();
  return (
    <section className="section" id="cafe">
      <div className="manifesto">
        <Reveal as="h2" className="display home-cafe-h">
          Eat like the earth is watching
        </Reveal>
        <Reveal delay={2} as="p" className="lede home-cafe-lede">
          We cook with what the season offers — grains, roots, leaf and ferment — and let restraint do the seasoning. Nothing rushed, nothing wasted, everything considered.
        </Reveal>
        <div className="manifesto-foot">
          <Reveal delay={3}><p className="lede" style={{ maxWidth: '30ch' }}>Sourced within reach of our doors, prepared by hands that know the difference.</p></Reveal>
          <Reveal delay={4}><button className="tlink" onClick={() => navigate('/about')}>Read our story</button></Reveal>
        </div>
      </div>
    </section>
  );
}

/* Closing: the Sanctuary's open door for teachers and makers. */
function HostBanner() {
  const navigate = useNavigate();
  return (
    <section className="section tight home-host" id="host">
      <div className="col-head">
        <div className="host-banner">
          <div className="hb-copy">
            <h4>Planning a workshop or retreat? Host it at the Sanctuary.</h4>
          </div>
          <button className="btn" onClick={() => navigate('/sanctuary/host')}>Host at the Sanctuary</button>
        </div>
      </div>
    </section>
  );
}

const ProductGrid = ({ products = [], onAddToCart, onProductClick }) => {
  /* Food products only for the signature section */
  const foodProducts = useMemo(() =>
    products.filter(p => !p.mainCategory || p.mainCategory === 'food'),
    [products]
  );

  return (
    <>
      <SEO
        title={pageData.home.title}
        description={pageData.home.description}
        keywords={pageData.home.keywords}
        url={siteConfig.url}
        structuredData={generateStructuredData('home')}
      />

      <Hero />

      {/* The place: café + Sanctuary as one, with the live calendar */}
      <Place />

      {/* The pivot: the practice that runs through all of it, then the kitchen */}
      <Practice />

      <Cafe />

      <section style={{ background: 'var(--paper)' }}>
        <Signatures products={foodProducts} onProductClick={onProductClick} />
      </section>

      <HostBanner />
    </>
  );
};

export default ProductGrid;
