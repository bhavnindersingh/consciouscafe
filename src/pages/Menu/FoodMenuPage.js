import React, { useState, useMemo } from 'react';
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

const catName = (slug = '') =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

const GROUP_META = {
  food:       { name: 'Food',       note: 'Plant-forward plates, all day' },
  drinks:     { name: 'Drinks',     note: 'Brewed, pressed & poured' },
  patisserie: { name: 'Patisserie', note: 'Fresh bakes & sweet endings' },
};

function DishCard({ product, onProductClick, onAddToCart }) {
  return (
    <div className="dish-card" onClick={() => onProductClick(product)}>
      <div className="dc-media">
        {product.image
          ? <img src={product.image} alt={product.name} loading="lazy" />
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

  /* Derive groups from mainCategory field */
  const groups = useMemo(() => {
    const seen = new Set();
    const list = [];
    products.forEach(p => {
      const g = p.mainCategory || 'food';
      if (!seen.has(g)) {
        seen.add(g);
        list.push(g);
      }
    });
    /* Sort so food → drinks → patisserie */
    const order = ['food', 'drinks', 'patisserie'];
    return list.sort((a, b) => {
      const ai = order.indexOf(a), bi = order.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [products]);

  const [activeGroup, setActiveGroup] = useState(null);

  React.useEffect(() => {
    if (!activeGroup && groups.length > 0) setActiveGroup(groups[0]);
  }, [groups, activeGroup]);

  /* Categories within active group */
  const categories = useMemo(() => {
    const seen = new Set();
    const list = [];
    products.filter(p => (p.mainCategory || 'food') === activeGroup).forEach(p => {
      if (!seen.has(p.category)) {
        seen.add(p.category);
        list.push({ id: p.category, name: catName(p.category) });
      }
    });
    return list;
  }, [products, activeGroup]);

  const [activeCat, setActiveCat] = useState(initialCat || null);

  React.useEffect(() => {
    if (initialCat) setActiveCat(initialCat);
  }, [initialCat]);

  React.useEffect(() => {
    if (categories.length > 0 && (!activeCat || !categories.find(c => c.id === activeCat))) {
      setActiveCat(categories[0].id);
    }
  }, [categories, activeCat]);

  const visibleProducts = useMemo(
    () => activeCat ? products.filter(p => p.category === activeCat) : [],
    [products, activeCat]
  );

  const groupCount = (g) => products.filter(p => (p.mainCategory || 'food') === g).length;

  return (
    <div className="menu-view" id="menu">
      <SEO title={seoData.title} description={seoData.description} keywords={seoData.keywords} url={seoData.url} />

      <div className="menu-hero">
        <Reveal><span className="eyebrow">The Menu · Auroville Road</span></Reveal>
        <Reveal delay={1}><h1 className="display">A season,<br /><em>plated.</em></h1></Reveal>
        <Reveal delay={2}><p className="lede">Everything is plant-forward and made in-house. Start with what you're after — a plate, a pour, or something sweet.</p></Reveal>
      </div>

      {loading && (
        <div style={{ padding: 'var(--gutter)', fontFamily: 'var(--ui)', color: 'var(--ink-mute)' }}>Loading menu…</div>
      )}
      {error && (
        <div style={{ padding: 'var(--gutter)', color: 'var(--ink-mute)' }}>Unable to load menu right now.</div>
      )}

      {!loading && groups.length > 0 && (
        <>
          {/* Group switch: Food / Drinks / Patisserie */}
          <div className="group-switch">
            {groups.map((g, i) => {
              const meta = GROUP_META[g] || { name: catName(g), note: '' };
              return (
                <button
                  key={g}
                  className={`group-tab ${activeGroup === g ? 'active' : ''}`}
                  onClick={() => { setActiveGroup(g); }}
                >
                  <span className="gt-idx">{String(i + 1).padStart(2, '0')}</span>
                  <span className="gt-name">{meta.name}</span>
                  <span className="gt-note">{meta.note}</span>
                  <span className="gt-count">{groupCount(g)} items</span>
                </button>
              );
            })}
          </div>

          <div className="menu-shell">
            <div className="menu-cats" key={activeGroup}>
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

            <div className="menu-items" key={activeCat}>
              {visibleProducts.map(p => (
                <DishCard key={p.id} product={p} onProductClick={onProductClick} onAddToCart={onAddToCart} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FoodMenuPage;
