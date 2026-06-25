import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../../components/seo/SEO/SEO';
import { toSlug } from '../../utils/slug';
import { variationCartItem } from '../../utils/cartItem';
import { useVariationPicker } from '../../components/products/VariationPicker/VariationPicker';
import { generateStructuredData, breadcrumb } from '../../utils/seoData';

const inr = n => `₹${(n || 0).toLocaleString('en-IN')}`;

// Map our dietary-label keys to schema.org RestrictedDiet values.
const DIET_SCHEMA = { vegan: 'VeganDiet', vegetarian: 'VegetarianDiet', gluten_free: 'GlutenFreeDiet' };

const Reveal = ({ children, className = '', delay = 0, as: Tag = 'div', style }) => (
  <Tag style={style} className={`reveal${delay ? ` d${delay}` : ''} ${className}`}>{children}</Tag>
);

const Arrow = ({ s = 16 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);


const catName = (slug = '') =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

function DishCard({ product, onProductClick, onAddToCart }) {
  return (
    <div className="dish-card" onClick={() => onProductClick(product)}>
      <div className="dc-media">
        {product.image
          ? <img src={product.image} alt={product.name} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', background: 'var(--paper-deep)' }} />
        }
        <button className="dc-add" aria-label={`Add ${product.name}`} onClick={e => { e.stopPropagation(); onAddToCart(product); }}>+</button>
      </div>
      <div className="dc-head">
        <h4>{product.name}</h4>
        <span className="dc-price">{inr(product.price)}</span>
      </div>
      {product.description && <p>{product.description}</p>}
    </div>
  );
}

const ProductDetailPage = ({ products = [], onAddToCart, loading = false }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  // null = the default form (base product); otherwise a chosen variation.
  const [variation, setVariation] = useState(null);

  const product = useMemo(
    () => products.find(p => toSlug(p.name) === productId) || null,
    [products, productId]
  );

  useEffect(() => { window.scrollTo(0, 0); setQty(1); setVariation(null); }, [productId]);

  const variations = product?.variations || [];
  const hasVariations = variations.length > 0;
  const unitPrice = (variation ? variation.price : product?.price) || product?.price || 0;

  const addSelected = () => {
    if (!product) return;
    if (variation) onAddToCart(variationCartItem(product, variation, qty));
    else onAddToCart({ ...product, quantity: qty });
  };

  const related = useMemo(() => {
    if (!product) return [];
    return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
  }, [products, product]);

  // The related cards' "+" opens the picker for dishes with variations; the main
  // Add-to-Bag button above keeps its own selector and isn't routed through this.
  const { requestAdd, picker } = useVariationPicker(onAddToCart);

  const handleProductClick = (p) => {
    navigate(`/product/${toSlug(p.name)}`);
  };

  if (!product) {
    // While the menu is still loading, the slug simply hasn't resolved yet —
    // show a neutral placeholder rather than a misleading "not found".
    if (loading || products.length === 0) {
      return <div style={{ minHeight: '60vh' }} aria-busy="true" />;
    }
    // Genuinely unknown slug: a real not-found, kept out of the index.
    return (
      <>
        <SEO title="Dish not found — Conscious Cafe Auroville" url={`/product/${productId}`} noIndex />
        <div style={{ padding: 'clamp(120px,18vh,200px) var(--gutter)', fontFamily: 'var(--display)', fontSize: 'clamp(30px,4vw,56px)' }}>
          Dish not found.
        </div>
      </>
    );
  }

  const nutri = [];
  if (product.nutrition?.calories) nutri.push({ v: product.nutrition.calories, l: 'kcal' });
  nutri.push({ v: catName(product.category), l: 'course' });

  return (
    <div className="dish-view-wrap">
      <SEO
        title={`${product.name} — Conscious Cafe Auroville`}
        description={product.description || `${product.name} — a consciously made dish at Conscious Cafe Auroville.`}
        url={`/product/${productId}`}
        image={product.image}
        type="product"
        structuredData={[
          generateStructuredData('menuItem', {
            id: productId,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.imageDetail || product.image,
            dietary: (product.dietaryLabels || [])
              .map(d => DIET_SCHEMA[d])
              .filter(Boolean),
          }),
          breadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Menu', path: '/menu' },
            { name: product.name, path: `/product/${productId}` },
          ]),
        ]}
      />

      <div className="dish-view">
        {/* Left: image */}
        <div className="dish-img">
          <button className="back" onClick={() => navigate('/menu')}>← Back to menu</button>
          {product.image && (
            <img src={product.imageDetail || product.image} alt={product.name} />
          )}
        </div>

        {/* Right: details */}
        <div className="dish-detail">
          <Reveal>
            <span className="eyebrow">{catName(product.category)}</span>
            <h1>{product.name}</h1>
            {product.description && <p className="d-desc">{product.description}</p>}
            <div className="d-price">{inr(unitPrice)}</div>

            {hasVariations && (
              <div className="d-variations">
                <span className="dv-label">Choose your option</span>
                <div className="dv-opts">
                  <button
                    type="button"
                    className={`dv-opt ${variation === null ? 'active' : ''}`}
                    onClick={() => setVariation(null)}
                  >
                    <span className="dvo-name">{product.name}</span>
                    <span className="dvo-price">{inr(product.price)}</span>
                  </button>
                  {variations.map(v => (
                    <button
                      key={v.id ?? v.name}
                      type="button"
                      className={`dv-opt ${variation && (variation.id ?? variation.name) === (v.id ?? v.name) ? 'active' : ''}`}
                      onClick={() => setVariation(v)}
                    >
                      <span className="dvo-name">{(v.name || '').trim()}</span>
                      <span className="dvo-price">{inr(v.price || product.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {nutri.length > 0 && (
              <div className="d-nutri">
                {nutri.map((n, i) => (
                  <div className="n" key={i}>
                    <span className="nv" style={{ textTransform: 'capitalize' }}>{n.v}</span>
                    <span className="nl">{n.l}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="d-actions">
              <div className="qty">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="qv">{qty}</span>
                <button onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <button className="btn forest" onClick={addSelected}>
                Add to Bag · {inr(unitPrice * qty)}
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section paper2">
          <Reveal>
            <div className="kicker-row">
              <span className="idx">More from</span>
              <span className="eyebrow">{catName(product.category)}</span>
            </div>
          </Reveal>
          <div className="menu-items" style={{ padding: 0, gridTemplateColumns: 'repeat(3,1fr)' }}>
            {related.map(r => (
              <DishCard key={r.id} product={r} onProductClick={handleProductClick} onAddToCart={requestAdd} />
            ))}
          </div>
        </section>
      )}

      {picker}
    </div>
  );
};

export default ProductDetailPage;
