/* Cart + toast + bag-drawer state, shared across the app via context.
   Wrap your routed tree in <CartProvider> and read state with useCart(). */
import React, { createContext, useContext, useState, useRef, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [toast, setToast] = useState({ msg: "", show: false });
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast({ msg, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((s) => ({ ...s, show: false })), 1800);
  }, []);

  const addToCart = useCallback((p, qty = 1) => {
    setItems((c) => {
      const ex = c.find((x) => x.id === p.id);
      if (ex) return c.map((x) => (x.id === p.id ? { ...x, qty: x.qty + qty } : x));
      return [...c, { id: p.id, name: p.name, price: p.price, src: p.src, qty }];
    });
    showToast(`${p.name} added to bag`);
  }, [showToast]);

  const changeQty = useCallback((id, d) => {
    setItems((c) => c.map((x) => (x.id === id ? { ...x, qty: Math.max(1, x.qty + d) } : x)));
  }, []);
  const removeItem = useCallback((id) => setItems((c) => c.filter((x) => x.id !== id)), []);

  const total = items.reduce((s, x) => s + x.price * x.qty, 0);
  const count = items.reduce((s, x) => s + x.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, changeQty, removeItem, total, count, bagOpen, setBagOpen, toast }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
