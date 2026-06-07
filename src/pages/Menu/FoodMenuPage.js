import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/seo/SEO/SEO';
import { generatePageSEO } from '../../utils/seoData';

const Arrow = ({ s = 16 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Reveal = ({ children, className = '', delay = 0, as: Tag = 'div', style }) => (
  <Tag style={style} className={`reveal${delay ? ` d${delay}` : ''} ${className}`}>{children}</Tag>
);

function imgUrl(src, { w, h, q = 84, mode } = {}) {
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

function DishCard({ product, onProductClick, onAddToCart }) {
  return (
    <div className="dish-card" onClick={() => onProductClick(product)}>
      <div className="dc-media">
        {product.image
          ? <img src={imgUrl(product.image, { w: 1000, q: 85 })} alt={product.name} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', background: 'var(--paper-deep)' }} />
        }
        <button
          className="dc-add"
          aria-label={`Add ${product.name}`}
          onClick={e => { e.stopPropagation(); onAddToCart(product); }}
        >+</button>
      </div>
      <div className="dc-head">
        <h4>{product.name}</h4>
        <span className="dc-price">₹{product.price}</span>
      </div>
      {product.description && <p>{product.description}</p>}
    </div>
  );
}

const FoodMenuPage = ({ products = [], onAddToCart, onProductClick, loading, error, initialCat }) => {
  const seoData = generatePageSEO('menu', {});

  const categories = useMemo(() => {
    const seen = new Set();
    const list = [];
    products.forEach(p => {
      if (!seen.has(p.category)) {
        seen.add(p.category);
        list.push({ id: p.category, name: catName(p.category) });
      }
    });
    return list;
  }, [products]);

  const [activeCat, setActiveCat] = useState(initialCat || null);

  React.useEffect(() => {
    if (!activeCat && categories.length > 0) setActiveCat(categories[0].id);
  }, [categories, activeCat]);

  React.useEffect(() => {
    if (initialCat) setActiveCat(initialCat);
  }, [initialCat]);

  const visibleProducts = useMemo(
    () => activeCat ? products.filter(p => p.category === activeCat) : [],
    [products, activeCat]
  );

  return (
    <div className="menu-view" id="menu">
      <SEO title={seoData.title} description={seoData.description} keywords={seoData.keywords} url={seoData.url} />

      <div className="menu-hero">
        <Reveal><span className="eyebrow">The Menu · Auroville Road</span></Reveal>
        <Reveal delay={1}><h1 className="display">A season,<br /><em>plated.</em></h1></Reveal>
        <Reveal delay={2}><p className="lede">Everything is plant-forward and made in-house. The menu shifts with the harvest, so what you find today is what the land offered this week.</p></Reveal>
      </div>

      {loading && (
        <div style={{ padding: 'var(--gutter)', fontFamily: 'var(--ui)', color: 'var(--ink-mute)' }}>Loading menu…</div>
      )}
      {error && (
        <div style={{ padding: 'var(--gutter)', color: 'var(--ink-mute)' }}>Unable to load menu right now.</div>
      )}

      {!loading && categories.length > 0 && (
        <div className="menu-shell">
          <div className="menu-cats">
            {categories.map(c => (
              <button
                key={c.id}
                className={`menu-cat ${activeCat === c.id ? 'active' : ''}`}
                onClick={() => setActiveCat(c.id)}
              >
                <span>
                  <span className="mc-name">{c.name}</span>
                </span>
                <span className="mc-count">{products.filter(p => p.category === c.id).length}</span>
              </button>
            ))}
          </div>

          <div className="menu-items">
            {visibleProducts.map(p => (
              <DishCard key={p.id} product={p} onProductClick={onProductClick} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodMenuPage;
