import React, { createContext, useContext, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useLocalStorage('consciousBakesCart', []);
  const [bagOpen, setBagOpen] = useState(false);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevItems, { ...product, quantity: product.quantity || 1 }];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const clearCart = () => { setCartItems([]); };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = subtotal * 0.05;
  const total = subtotal + gst;
  const isEmpty = cartItems.length === 0;
  const getItem = (productId) => cartItems.find((item) => item.id === productId);

  /* Aliases used by CartDrawer / Nav */
  const changeQty = (productId, delta) => {
    const item = cartItems.find(i => i.id === productId);
    if (!item) return;
    const next = (item.quantity || 1) + delta;
    if (next <= 0) removeFromCart(productId);
    else updateQuantity(productId, next);
  };

  const value = {
    cartItems,
    items: cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    removeItem: removeFromCart,
    changeQty,
    clearCart,
    cartItemCount,
    count: cartItemCount,
    subtotal,
    gst,
    total,
    isEmpty,
    getItem,
    bagOpen,
    setBagOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
