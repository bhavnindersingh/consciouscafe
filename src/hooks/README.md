# Hooks

This directory contains custom React hooks that encapsulate reusable stateful logic.

## Purpose

Custom hooks allow you to extract component logic into reusable functions following React's hooks rules.

## Guidelines

1. **Naming**: All hooks must start with "use" (e.g., `useCart`, `useAuth`)
2. **Single Responsibility**: Each hook should do one thing well
3. **Reusability**: Hooks should be generic enough to use in multiple components
4. **Documentation**: Add JSDoc comments explaining parameters and return values

## Common Hooks to Create

- `useAuth.js` - Authentication state and methods
- `useCart.js` - Shopping cart operations
- `useProducts.js` - Product data fetching and filtering
- `useLocalStorage.js` - localStorage with React state sync
- `useDebounce.js` - Debounce values
- `useMediaQuery.js` - Responsive breakpoints

## Example Hook

```javascript
/**
 * Custom hook for managing cart state
 * @returns {Object} Cart state and methods
 */
export function useCart() {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    // logic here
  };

  const removeFromCart = (itemId) => {
    // logic here
  };

  return { cart, addToCart, removeFromCart };
}
```

## Usage

```javascript
import { useCart } from 'hooks/useCart';

function MyComponent() {
  const { cart, addToCart } = useCart();
  // ...
}
```
