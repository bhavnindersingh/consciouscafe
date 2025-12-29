# Context

This directory contains React Context providers for application-wide state management.

## Purpose

Context providers manage global state that needs to be accessed by many components throughout the app.

## Current Contexts

- **AuthContext.js** - Authentication state and user information
- **CartContext.js** - Shopping cart state (to be created)
- **ThemeContext.js** - Dark mode / theme preferences (planned)

## When to Use Context

Use Context when:
1. Data needs to be accessed by many components at different nesting levels
2. Prop drilling becomes cumbersome
3. The state is truly global (user auth, theme, cart)

**Don't use Context for:**
- Frequently changing data (can cause performance issues)
- Data that's only needed by a few components
- Complex state logic (consider Redux/Zustand for that)

## Structure

Each context should provide:
1. Context creation
2. Provider component
3. Custom hook for easy consumption

## Example

```javascript
// context/CartContext.js
import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const value = { cart, addToCart };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook for consuming context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
```

## Usage

```javascript
// In App.js
import { CartProvider } from 'context/CartContext';

function App() {
  return (
    <CartProvider>
      <YourApp />
    </CartProvider>
  );
}

// In any component
import { useCart } from 'context/CartContext';

function ProductCard() {
  const { addToCart } = useCart();
  // ...
}
```
