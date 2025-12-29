import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CartContext = createContext();

/**
 * CartProvider component that wraps the app and provides cart functionality
 */
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useLocalStorage('consciousBakesCart', []);

  /**
   * Add item to cart or update quantity if it already exists
   */
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

  /**
   * Update quantity of an item in cart
   */
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

  /**
   * Remove item from cart
   */
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  /**
   * Clear all items from cart
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Get total number of items in cart
   */
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  /**
   * Get cart subtotal
   */
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  /**
   * Get cart total with GST
   */
  const gst = subtotal * 0.05; // 5% GST
  const total = subtotal + gst;

  /**
   * Check if cart is empty
   */
  const isEmpty = cartItems.length === 0;

  /**
   * Get item by id
   */
  const getItem = (productId) => {
    return cartItems.find((item) => item.id === productId);
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartItemCount,
    subtotal,
    gst,
    total,
    isEmpty,
    getItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Custom hook to use cart context
 * @returns {Object} Cart state and methods
 */
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
