import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../../components/seo/SEO/SEO';
import { toSlug } from '../../utils/slug';

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
        <span className="dc-price">₹{product.price}</span>
      </div>
      {product.description && <p>{product.description}</p>}
    </div>
  );
}

const ProductDetailPage = ({ products = [], onAddToCart }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  const product = useMemo(
    () => products.find(p => toSlug(p.name) === productId) || null,
    [products, productId]
  );

  useEffect(() => { window.scrollTo(0, 0); setQty(1); }, [productId]);

  const related = useMemo(() => {
    if (!product) return [];
    return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
  }, [products, product]);

  const handleProductClick = (p) => {
    navigate(`/product/${toSlug(p.name)}`);
  };

  if (!product) {
    return (
      <div style={{ padding: 'clamp(120px,18vh,200px) var(--gutter)', fontFamily: 'var(--display)', fontSize: 'clamp(30px,4vw,56px)' }}>
        Dish not found.
      </div>
    );
  }

  const nutri = [];
  if (product.nutrition?.calories) nutri.push({ v: product.nutrition.calories, l: 'kcal' });
  nutri.push({ v: catName(product.category), l: 'course' });

  return (
    <div className="dish-view-wrap">
      <SEO
        title={`${product.name} — Conscious Café`}
        description={product.description}
        url={`/product/${productId}`}
        image={product.image}
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
            <div className="d-price">₹{product.price.toLocaleString('en-IN')}</div>

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
              <button className="btn forest" onClick={() => onAddToCart({ ...product, quantity: qty })}>
                Add to Bag · ₹{(product.price * qty).toLocaleString('en-IN')}
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
              <DishCard key={r.id} product={r} onProductClick={handleProductClick} onAddToCart={onAddToCart} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
