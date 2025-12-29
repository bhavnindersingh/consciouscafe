# Utils

This directory contains utility functions and helpers used throughout the application.

## Purpose

Utility functions are pure functions that perform specific tasks without side effects.

## Current Utilities

- **gumlet.js** - Image CDN URL generation and optimization
- **whatsapp.js** - WhatsApp integration utilities
- **seoData.js** - SEO metadata and structured data
- **sitemapGenerator.js** - Sitemap generation utilities
- **formatters.js** - Date, price, and text formatting (to be created)
- **validators.js** - Form validation functions (to be created)

## Guidelines

1. **Pure Functions**: Utilities should be pure functions (same input = same output)
2. **Single Responsibility**: Each utility should do one thing well
3. **Testable**: Write unit tests for utility functions
4. **Well Documented**: Add JSDoc comments explaining parameters and return values
5. **No Side Effects**: Avoid API calls, mutations, or side effects in utilities

## Common Utility Categories

### Formatters
```javascript
// formatters.js
export function formatPrice(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency
  }).format(amount);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN');
}
```

### Validators
```javascript
// validators.js
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isValidPhone(phone) {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone);
}
```

### String Helpers
```javascript
// stringHelpers.js
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text, length = 100) {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}
```

## Usage

```javascript
import { formatPrice, formatDate } from 'utils/formatters';
import { isValidEmail } from 'utils/validators';

const price = formatPrice(99.99);
const date = formatDate(new Date());
const valid = isValidEmail('test@example.com');
```
