import React from 'react';

const Arrow = ({ s = 16 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function imgResized(src, w = 160) {
  if (!src) return '';
  try {
    const url = new URL(src);
    url.searchParams.set('w', w);
    url.searchParams.set('h', Math.round(w * 1.2));
    url.searchParams.set('mode', 'crop');
    url.searchParams.set('fm', 'auto');
    return url.toString();
  } catch { return src; }
}

const Cart = ({ isOpen, onClose, cartItems = [], onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const subtotal = cartItems.reduce((s, x) => s + x.price * (x.quantity || 1), 0);

  return (
    <>
      <div className={`scrim ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`drawer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
        <div className="drawer-head">
          <h3>Your Bag</h3>
          <button className="x" onClick={onClose} aria-label="Close">×</button>
        </div>

        {cartItems.length === 0 ? (
          <div className="drawer-body">
            <div className="cart-empty">
              <div className="ce-mark">Nothing here yet</div>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>A quiet plate awaits. Wander the menu and gather what calls to you.</p>
            </div>
          </div>
        ) : (
          <div className="drawer-body">
            {cartItems.map(item => (
              <div className="cart-row" key={item.id}>
                {item.image && <img src={imgResized(item.image, 128)} alt={item.name} />}
                <div>
                  <h5>{item.name}</h5>
                  <div className="cr-meta">
                    <button onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}>−</button>
                    <span>{item.quantity || 1}</span>
                    <button onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}>+</button>
                    <button onClick={() => onRemoveItem(item.id)} style={{ marginLeft: 6 }}>remove</button>
                  </div>
                </div>
                <div className="cr-price">₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="drawer-foot">
            <div className="ftot">
              <span className="l">Subtotal</span>
              <span className="v">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <button className="btn solid" onClick={onCheckout}>Proceed to Checkout <Arrow /></button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Cart;
