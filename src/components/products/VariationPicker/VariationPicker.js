import React, { useCallback, useEffect, useRef, useState } from 'react';
import { variationCartItem } from '../../../utils/cartItem';

const inr = n => `₹${(n || 0).toLocaleString('en-IN')}`;

const Arrow = ({ s = 16 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Pop-up chooser for a dish with variations. Mirrors the detail page exactly:
 * base form is preselected (variation === null), each option carries its own
 * complete price, and the cart line is built with `variationCartItem` / a plain
 * `{...product, quantity}` so lines merge identically wherever they're added.
 */
function VariationPicker({ product, onAddToCart, onClose }) {
  const [variation, setVariation] = useState(null); // null = base form
  const [qty, setQty] = useState(1);
  const panelRef = useRef(null);

  const unitPrice = (variation ? variation.price : product.price) || product.price || 0;

  const add = () => {
    if (variation) onAddToCart(variationCartItem(product, variation, qty));
    else onAddToCart({ ...product, quantity: qty });
    onClose();
  };

  // Escape to close + lock background scroll while open; restore focus on close.
  useEffect(() => {
    const prevFocus = document.activeElement;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (prevFocus instanceof HTMLElement) prevFocus.focus();
    };
  }, [onClose]);

  return (
    <div className="sa-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="sa-panel vp-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Choose your option for ${product.name}`}
        ref={panelRef}
        tabIndex={-1}
      >
        <button className="sa-close" onClick={onClose} aria-label="Close">×</button>

        <div className="vp-head">
          {product.image && (
            <div className="vp-media">
              <img src={product.image} alt={product.name} />
            </div>
          )}
          <div>
            <span className="sa-flag"><span className="dot" />Choose your option</span>
            <h3 className="display vp-title">{product.name}</h3>
            {product.description && <p className="vp-desc">{product.description}</p>}
          </div>
        </div>

        <div className="vp-opts">
          <button
            type="button"
            className={`dv-opt ${variation === null ? 'active' : ''}`}
            onClick={() => setVariation(null)}
          >
            <span className="dvo-name">{product.name}</span>
            <span className="dvo-price">{inr(product.price)}</span>
          </button>
          {product.variations.map(v => {
            const active = variation && (variation.id ?? variation.name) === (v.id ?? v.name);
            return (
              <button
                key={v.id ?? v.name}
                type="button"
                className={`dv-opt ${active ? 'active' : ''}`}
                onClick={() => setVariation(v)}
              >
                <span className="dvo-name">{(v.name || '').trim()}</span>
                <span className="dvo-price">{inr(v.price || product.price)}</span>
              </button>
            );
          })}
        </div>

        <div className="vp-foot">
          <div className="qty">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
            <span className="qv">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} aria-label="Increase quantity">+</button>
          </div>
          <button className="btn forest vp-add" onClick={add}>
            Add to Bag · {inr(unitPrice * qty)} <Arrow />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Wraps an `onAddToCart` handler so a "+" on a product with variations opens the
 * picker instead of silently adding the base form. Returns `requestAdd` (use in
 * place of the raw handler) and `picker` (render once per page).
 *
 * Items without variations — and already-resolved `variationCartItem`s, which
 * strip `variations` — fall straight through to a direct add.
 */
export function useVariationPicker(onAddToCart) {
  const [picking, setPicking] = useState(null);

  const requestAdd = useCallback((item) => {
    if (item?.variations?.length) setPicking(item);
    else onAddToCart(item);
  }, [onAddToCart]);

  const picker = picking ? (
    <VariationPicker product={picking} onAddToCart={onAddToCart} onClose={() => setPicking(null)} />
  ) : null;

  return { requestAdd, picker };
}

export default VariationPicker;
