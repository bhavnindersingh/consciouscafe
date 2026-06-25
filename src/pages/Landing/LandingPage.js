import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/seo/SEO/SEO';
import { siteConfig, generateStructuredData, breadcrumb } from '../../utils/seoData';
import { getGumletUrl } from '../../utils/gumlet';
import { toSlug } from '../../utils/slug';
import LANDING_PAGES from '../../data/landingPages.json';

const Arrow = ({ s = 16 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Reveal = ({ children, className = '', delay = 0, style }) => (
  <div style={style} className={`reveal${delay ? ` d${delay}` : ''} ${className}`}>{children}</div>
);

const fallbackHero = getGumletUrl('images/hero-poster.jpg', { width: 1920, height: 1080, mode: 'crop', quality: 85, format: 'auto' });

const LandingPage = ({ page, products = [], onAddToCart, onProductClick }) => {
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, [page.slug]);

  const resolve = (name) => products.find(p => toSlug(p.name) === toSlug(name));
  const picks = (page.highlights || []).map(resolve).filter(Boolean);

  const heroSrc = picks[0]?.imageHero || picks[0]?.image || fallbackHero;

  const handlePick = (p) =>
    onProductClick ? onProductClick(p) : navigate(`/product/${toSlug(p.name)}`);

  const faqSchema = page.faqs && page.faqs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: page.faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null;

  const structuredData = [
    generateStructuredData('restaurant'),
    ...(faqSchema ? [faqSchema] : []),
    breadcrumb([{ name: 'Home', path: '/' }, { name: page.h1, path: `/${page.slug}` }]),
  ];

  const related = (page.relatedPages || [])
    .map(slug => LANDING_PAGES.find(p => p.slug === slug))
    .filter(Boolean);

  return (
    <main className="landing-view">
      <SEO
        title={page.title}
        description={page.description}
        keywords={page.keywords}
        url={`${siteConfig.url}/${page.slug}`}
        structuredData={structuredData}
      />

      <header className="visit-hero">
        <img src={heroSrc} alt={page.h1} loading="eager" />
        <div className="visit-hero-inner">
          <div style={{ maxWidth: 1500, margin: '0 auto', width: '100%' }}>
            <span className="eyebrow on-dark reveal">{page.eyebrow}</span>
            <h1 className="display reveal">{page.h1}</h1>
            <p className="hero-sub reveal">{page.intro}</p>
          </div>
        </div>
      </header>

      <section className="section">
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          {page.sections.map((s, i) => (
            <Reveal key={s.heading} delay={i + 1} style={{ marginBottom: 'clamp(32px,5vh,56px)' }}>
              <h2 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(26px,3.4vw,42px)', marginBottom: 16 }}>{s.heading}</h2>
              {s.body.map((para, j) => (
                <p key={j} style={{ fontFamily: 'var(--ui)', lineHeight: 1.7, color: 'var(--ink-mute)', marginBottom: 14 }}>{para}</p>
              ))}
            </Reveal>
          ))}

          <div className="visit-cta" style={{ marginTop: 8 }}>
            <button className="btn forest" onClick={() => navigate(page.menuCta.to)}>
              {page.menuCta.label} <Arrow />
            </button>
          </div>
        </div>
      </section>

      {picks.length > 0 && (
        <section className="section paper2">
          <div className="kicker-row">
            <span className="idx">From the menu</span>
            <span className="eyebrow">Try these</span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 'clamp(16px,2vw,28px)',
              marginTop: 'clamp(24px,4vh,40px)',
            }}
          >
            {picks.map(p => (
              <div className="dish-card" key={p.id} onClick={() => handlePick(p)}>
                <div className="dc-media">
                  {p.image
                    ? <img src={p.image} alt={p.name} loading="lazy" />
                    : <div style={{ width: '100%', height: '100%', background: 'var(--paper-deep)' }} />}
                  {onAddToCart && (
                    <button
                      className="dc-add"
                      aria-label={`Add ${p.name}`}
                      onClick={e => { e.stopPropagation(); onAddToCart(p); }}
                    >+</button>
                  )}
                </div>
                <div className="dc-head">
                  <h4>{p.name}</h4>
                  <span className="dc-price">₹{(p.price || 0).toLocaleString('en-IN')}</span>
                </div>
                {p.description && <p>{p.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {faqSchema && (
        <section className="section faq-section">
          <div className="kicker-row">
            <span className="idx">Good to know</span>
            <span className="eyebrow">Questions</span>
          </div>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            {page.faqs.map((f, i) => (
              <Reveal className="faq-item" delay={i + 1} key={f.q} style={{ padding: '22px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(27,26,22,0.12)' }}>
                <h3 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(20px,2.4vw,28px)', marginBottom: 8 }}>{f.q}</h3>
                <p style={{ fontFamily: 'var(--ui)', lineHeight: 1.6, color: 'var(--ink-mute)' }}>{f.a}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section">
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            <span className="eyebrow">Explore more</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 18 }}>
              {related.map(r => (
                <button key={r.slug} className="btn" onClick={() => navigate(`/${r.slug}`)}>
                  {r.h1} <Arrow />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default LandingPage;
