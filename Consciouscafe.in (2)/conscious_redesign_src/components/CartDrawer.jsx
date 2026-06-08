import React from "react";
import { Arrow } from "./primitives";
import { CC } from "../data/menu";
import { useCart } from "../cart/CartContext";

export function CartDrawer() {
  const { items, bagOpen, setBagOpen, changeQty, removeItem, total } = useCart();
  const onClose = () => setBagOpen(false);
  return (
    <React.Fragment>
      <div className={`scrim ${bagOpen ? "open" : ""}`} onClick={onClose}></div>
      <aside className={`drawer ${bagOpen ? "open" : ""}`} aria-hidden={!bagOpen}>
        <div className="drawer-head">
          <h3>Your Bag</h3>
          <button className="x" onClick={onClose} aria-label="Close">×</button>
        </div>
        {items.length === 0 ? (
          <div className="drawer-body">
            <div className="cart-empty">
              <div className="ce-mark">Nothing here yet</div>
              <p style={{ fontFamily: "var(--serif)", fontSize: "18px" }}>A quiet plate awaits. Wander the menu and gather what calls to you.</p>
            </div>
          </div>
        ) : (
          <div className="drawer-body">
            {items.map((it) => (
              <div className="cart-row" key={it.id}>
                <img src={CC.img(it.src, { w: 160, h: 190, mode: "crop" })} alt={it.name} />
                <div>
                  <h5>{it.name}</h5>
                  <div className="cr-meta">
                    <button onClick={() => changeQty(it.id, -1)}>−</button>
                    <span>{it.qty}</span>
                    <button onClick={() => changeQty(it.id, 1)}>+</button>
                    <button onClick={() => removeItem(it.id)} style={{ marginLeft: 6 }}>remove</button>
                  </div>
                </div>
                <div className="cr-price">₹{(it.price * it.qty).toLocaleString("en-IN")}</div>
              </div>
            ))}
          </div>
        )}
        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="ftot">
              <span className="l">Subtotal</span>
              <span className="v">₹{total.toLocaleString("en-IN")}</span>
            </div>
            <button className="btn solid">Proceed to Checkout <Arrow /></button>
          </div>
        )}
      </aside>
    </React.Fragment>
  );
}
