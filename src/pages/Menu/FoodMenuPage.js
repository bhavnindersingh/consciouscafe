import React, { useState, useMemo } from 'react';
import SEO from '../../components/seo/SEO/SEO';
import { generatePageSEO } from '../../utils/seoData';

const catName = (slug = '') =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

const GROUP_META = {
  food:       { name: 'Food',       note: 'Plant-forward plates, all day' },
  drinks:     { name: 'Drinks',     note: 'Pressed, brewed & poured' },
  patisserie: { name: 'Patisserie', note: 'Fresh bakes & sweet endings' },
};

const CATEGORY_META = {
  'toast':               { name: 'Toast',              note: 'Sourdough, slow-fermented' },
  'all-day-breakfast':   { name: 'All Day Breakfast',  note: 'Morning, whenever it finds you' },
  'smoothie-bowls':      { name: 'Smoothie Bowls',     note: 'Fruit, grain & quiet ritual' },
  'earth-grills-crisps': { name: 'Earth Grills & Crisps', note: 'Fire & root' },
  'salads':              { name: 'Salads',             note: 'Garden-led, dressed with care' },
  'platters':            { name: 'Platters',           note: 'Made to gather around' },
  'earth-bowls':         { name: 'Earth Bowls',        note: 'A continent in a single bowl' },
  'noodle-bowls':        { name: 'Noodle Bowls',       note: 'Broth, brewed long' },
  'pasta-pizza':         { name: 'Pasta',              note: 'Hand-finished, herb-forward' },
  'pasta':               { name: 'Pasta',              note: 'Hand-finished, herb-forward' },
  'desserts':            { name: 'Desserts',           note: 'A gentle, plant-based close' },
  'juices':              { name: 'Juices',             note: 'Cold-pressed, fruit-led' },
  'mocktails':           { name: 'Mocktails',          note: 'Shaken & sparkling' },
  'floral-teas':         { name: 'Floral Teas',        note: 'Petal-steeped, calming' },
  'chai':                { name: 'Chai',               note: 'Spiced, brewed slow' },
  'coffee':              { name: 'Coffee',             note: 'Small-batch beans' },
};

const CATEGORY_ORDER = [
  'toast', 'all-day-breakfast', 'smoothie-bowls', 'earth-grills-crisps',
  'salads', 'platters', 'earth-bowls', 'noodle-bowls', 'pasta-pizza', 'pasta',
  'desserts', 'juices', 'mocktails', 'floral-teas', 'chai', 'coffee',
];

/* Enrich products with bestseller + diet when Supabase doesn't carry these fields.
   Matched by normalised product name (lowercase, trimmed). */
const ENRICHMENT = {
  'mushroom toast':           { diet: 'vegan' },
  'avocado toast':            { bestseller: true, diet: 'veg / egg' },
  'pesto cream cheese':       { diet: 'veg' },
  'burrata bruschetta':       { diet: 'veg' },
  'muhammara':                { diet: 'vegan' },
  'cilbir':                   { diet: 'veg / egg' },
  'pancake':                  { diet: 'veg / GF' },
  'french toast':             { bestseller: true, diet: 'veg / egg' },
  'berry blast smoothie':     { diet: 'vegan' },
  'cocoa peanut smoothie':    { diet: 'vegan' },
  'goodness bowl':            { bestseller: true, diet: 'veg' },
  'fruit bliss bowl':         { diet: 'vegan' },
  'overnight oats':           { diet: 'vegan' },
  'matcha chia pudding':      { diet: 'vegan' },
  'grilled sweet potato':     { diet: 'vegan / GF' },
  'grilled tofu satay':       { bestseller: true, diet: 'vegan / GF' },
  'taro root crisps':         { diet: 'vegan / GF' },
  'cassava crisps':           { diet: 'vegan / GF' },
  'watermelon feta':          { diet: 'veg / GF' },
  'tropical salad':           { diet: 'veg / GF' },
  'botanical balance salad':  { diet: 'veg / GF' },
  'yogi platter':             { diet: 'vegan' },
  'zulfi platter':            { diet: 'veg / egg' },
  'mezze platter':            { diet: 'vegan' },
  'thai bowl':                { bestseller: true, diet: 'vegan' },
  'tokyo katsu':              { diet: 'vegan' },
  'rangla punjab':            { bestseller: true, diet: 'veg' },
  'sol bowl':                 { diet: 'vegan' },
  'mezze kodo bowl':          { diet: 'vegan' },
  'khao soi':                 { diet: 'vegan' },
  'laksa':                    { bestseller: true, diet: 'vegan' },
  'miso ramen':               { diet: 'vegan' },
  'bibim guksu':              { diet: 'vegan' },
  'meatless meatball':        { diet: 'veg' },
  'zucchini zoodles':         { bestseller: true, diet: 'veg / GF' },
  'coconut panna cotta':      { bestseller: true, diet: 'vegan' },
  'chocolate mousse':         { diet: 'vegan' },
  'peach ice tea':            { bestseller: true, diet: 'vegan / GF' },
  'iced vanilla latte':       { bestseller: true, diet: 'veg' },
};

function enrich(product) {
  const key = (product.name || '').toLowerCase().trim();
  const extra = ENRICHMENT[key] || {};
  return { ...extra, ...product, bestseller: product.bestseller || extra.bestseller, diet: product.diet || extra.diet };
}

function DishCard({ product, onProductClick, onAddToCart }) {
  const p = enrich(product);
  return (
    <div className="dish-card" onClick={() => onProductClick(p)}>
      <div className="dc-media">
        {p.image
          ? <img src={p.image} alt={p.name} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', background: 'var(--paper-deep)' }} />
        }
        {p.bestseller && <span className="dc-bestseller">House Favourite</span>}
        <button
          className="dc-add"
          aria-label={`Add ${p.name}`}
          onClick={e => { e.stopPropagation(); onAddToCart(p); }}
        >+</button>
      </div>
      <div className="dc-head">
        <h4>{p.name}</h4>
        <span className="dc-price">₹{(p.price || 0).toLocaleString('en-IN')}</span>
      </div>
      {p.description && <p>{p.description}</p>}
      {p.diet && <span className="dc-diet">{p.diet}</span>}
    </div>
  );
}

const FoodMenuPage = ({ products = [], onAddToCart, onProductClick, loading, error, initialCat }) => {
  const seoData = generatePageSEO('menu', {});

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

  const [activeGroup, setActiveGroup] = useState(null);

  React.useEffect(() => {
    if (!activeGroup && groups.length > 0) setActiveGroup(groups[0]);
  }, [groups, activeGroup]);

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

  return (
    <div className="menu-view" id="menu">
      <SEO title={seoData.title} description={seoData.description} keywords={seoData.keywords} url={seoData.url} />

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
                  key={g}
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
            <div className="menu-cats" key={activeGroup}>
              {categories.map(c => (
                <button
                  key={c.id}
                  className={`menu-cat ${activeCat === c.id ? 'active' : ''}`}
                  onClick={() => setActiveCat(c.id)}
                >
                  <span>
                    <span className="mc-name">{c.name}</span>
                    {CATEGORY_META[c.id]?.note && <span className="mc-note">{CATEGORY_META[c.id].note}</span>}
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

          <div className="menu-accordion">
            {categories.map(c => {
              const isOpen = mobileOpen === c.id;
              return (
                <div key={c.id} className={`acc-section${isOpen ? ' open' : ''}`}>
                  <button
                    className="acc-head"
                    onClick={() => setMobileOpen(isOpen ? null : c.id)}
                  >
                    <span>
                      <span className="acc-name">{c.name}</span>
                      {CATEGORY_META[c.id]?.note && <span className="acc-note">{CATEGORY_META[c.id].note}</span>}
                    </span>
                    <span className="acc-chevron">{isOpen ? '−' : '+'}</span>
                  </button>
                  <div className="acc-body">
                    <div className="acc-inner">
                      {products.filter(p => p.category === c.id).map(p => (
                        <DishCard key={p.id} product={p} onProductClick={onProductClick} onAddToCart={onAddToCart} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default FoodMenuPage;
