import React, { useState, useMemo } from 'react';
import SEO from '../../components/seo/SEO/SEO';
import { generatePageSEO, generateStructuredData, breadcrumb } from '../../utils/seoData';
import { CATEGORY_META, CATEGORY_ORDER, MAIN_CATEGORY_META as GROUP_META } from '../../utils/menuEnrichment';
import { useVariationPicker } from '../../components/products/VariationPicker/VariationPicker';

const inr = n => `₹${(n || 0).toLocaleString('en-IN')}`;

const catName = (slug = '') =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

const DIETARY_LABELS = {
  vegetarian:        { label: 'Vegetarian',          emoji: '🟢'   },
  vegan:             { label: 'Vegan',               emoji: '🌱'   },
  contains_egg:      { label: 'Contains Egg',        emoji: '🥚'   },
  gluten_free:       { label: 'Gluten-Free',         emoji: '🌾🚫' },
  contains_dairy:    { label: 'Contains Dairy',      emoji: '🥛'   },
  contains_nuts_soy: { label: 'Contains Nuts / Soy', emoji: '🥜'   },
  spicy:             { label: 'Spicy',               emoji: '🌶️'   },
};

function DishCard({ product: p, onProductClick, onAddToCart }) {
  return (
    <div className="dish-card" onClick={() => onProductClick(p)}>
      <div className="dc-media">
        {p.image
          ? <img src={p.image} alt={p.name} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', background: 'var(--paper-deep)' }} />
        }
        <button
          className="dc-add"
          aria-label={`Add ${p.name}`}
          onClick={e => { e.stopPropagation(); onAddToCart(p); }}
        >+</button>
      </div>
      <div className="dc-head">
        <h4>{p.name}</h4>
        <span className="dc-price">
          {p.variations?.length > 0 && <span className="dc-from">from </span>}{inr(p.price)}
        </span>
      </div>
      {p.description && <p>{p.description}</p>}
      {p.dietaryLabels?.length > 0 && (
        <div className="dc-labels">
          {p.dietaryLabels.map((key, i) => {
            const def = DIETARY_LABELS[key] || { label: key, emoji: '' };
            return <span key={key ?? i} className="dc-diet">{def.emoji} {def.label}</span>;
          })}
        </div>
      )}
    </div>
  );
}

const FoodMenuPage = ({ products = [], onAddToCart, onProductClick, loading, error, initialCat, initialGroup }) => {
  // Distinct SEO per menu section (food / drinks / patisserie) when arrived via
  // a dedicated route; otherwise the combined menu page.
  const seoKey = ['food', 'drinks', 'patisserie'].includes(initialGroup) ? initialGroup : 'menu';
  const seoData = generatePageSEO(seoKey, {
    url: `https://consciouscafe.in/${seoKey === 'menu' ? 'menu' : `menu/${seoKey}`}`,
  });
  const trail = seoKey === 'menu'
    ? [{ name: 'Home', path: '/' }, { name: 'Menu', path: '/menu' }]
    : [{ name: 'Home', path: '/' }, { name: 'Menu', path: '/menu' }, { name: seoKey[0].toUpperCase() + seoKey.slice(1), path: `/menu/${seoKey}` }];

  /* Derive groups from mainCategory field — always food → drinks → patisserie */
  const groups = useMemo(() => {
    const seen = new Set();
    const list = [];
    products.forEach(p => {
      const g = p.mainCategory || 'food';
      if (!seen.has(g)) { seen.add(g); list.push(g); }
    });
    const order = ['food', 'drinks', 'patisserie'];
    return list.sort((a, b) => {
      const ai = order.indexOf(a), bi = order.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [products]);

  const [activeGroup, setActiveGroup] = useState(initialGroup || null);

  React.useEffect(() => {
    if (initialGroup) { setActiveGroup(initialGroup); return; }
    if (!activeGroup && groups.length > 0) setActiveGroup(groups[0]);
  }, [groups, activeGroup, initialGroup]);

  /* Categories within active group — sorted to reference menu order */
  const categories = useMemo(() => {
    const seen = new Set();
    const list = [];
    products.filter(p => (p.mainCategory || 'food') === activeGroup).forEach(p => {
      if (!seen.has(p.category)) {
        seen.add(p.category);
        const meta = CATEGORY_META[p.category];
        list.push({ id: p.category, name: meta?.name || catName(p.category) });
      }
    });
    list.sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a.id), bi = CATEGORY_ORDER.indexOf(b.id);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return list;
  }, [products, activeGroup]);

  const [activeCat, setActiveCat] = useState(initialCat || null);
  const [mobileOpen, setMobileOpen] = useState(null);

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

  // A "+" on a dish with variations opens the picker; plain dishes add directly.
  const { requestAdd, picker } = useVariationPicker(onAddToCart);

  return (
    <div className="menu-view" id="menu">
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={seoData.url}
        structuredData={[generateStructuredData('restaurant'), breadcrumb(trail)]}
      />

      <div className="menu-hero">
        <span className="eyebrow">The Menu · Auroville Road</span>
        <h1 className="display">A season,<br /><em>plated.</em></h1>
        <p className="lede">Everything is plant-forward and made in-house. Start with what you're after — a plate, a pour, or something sweet.</p>
      </div>

      {loading && (
        <div style={{ padding: 'var(--gutter)', fontFamily: 'var(--ui)', color: 'var(--ink-mute)' }}>Loading menu…</div>
      )}
      {error && (
        <div style={{ padding: 'var(--gutter)', color: 'var(--ink-mute)' }}>Unable to load menu right now.</div>
      )}

      {!loading && groups.length > 0 && (
        <>
          <div className="group-switch" style={{ gridTemplateColumns: `repeat(${groups.length}, 1fr)` }}>
            {groups.map((g, i) => {
              const meta = GROUP_META[g] || { name: catName(g), note: '' };
              return (
                <button
                  key={g || `group-${i}`}
                  className={`group-tab ${activeGroup === g ? 'active' : ''}`}
                  onClick={() => setActiveGroup(g)}
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
            <div className="menu-cats" key={`cats-${activeGroup}`}>
              {categories.map((c, i) => (
                <button
                  key={c.id || `cat-${i}`}
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

            <div className="menu-items" key={`items-${activeCat}`}>
              {visibleProducts.map((p, i) => (
                <DishCard key={p.id ?? p.name ?? i} product={p} onProductClick={onProductClick} onAddToCart={requestAdd} />
              ))}
            </div>
          </div>

          <div className="menu-accordion">
            {categories.map((c, i) => {
              const isOpen = mobileOpen === c.id;
              const accKey = c.id || `cat-${i}`;
              return (
                <div key={accKey} className={`acc-section${isOpen ? ' open' : ''}`}>
                  <button
                    className="acc-head"
                    onClick={() => setMobileOpen(isOpen ? null : c.id)}
                  >
                    <span>
                      <span className="acc-name">{c.name}</span>
                    </span>
                    <span className="acc-chevron">{isOpen ? '−' : '+'}</span>
                  </button>
                  <div className="acc-body">
                    <div className="acc-inner">
                      {products.filter(p => p.category === c.id).map((p, i) => (
                        <DishCard key={p.id ?? p.name ?? i} product={p} onProductClick={onProductClick} onAddToCart={requestAdd} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {picker}
    </div>
  );
};

export default FoodMenuPage;
