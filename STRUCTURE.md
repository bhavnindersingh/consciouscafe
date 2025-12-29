# Repository Structure Guide

This document provides a comprehensive guide to the organization of the Conscious Cafe codebase.

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Key Principles](#key-principles)
4. [Where to Put New Code](#where-to-put-new-code)
5. [Import Conventions](#import-conventions)
6. [Examples](#examples)

## Overview

The repository follows a feature-based organization that separates:
- **Pages** - Route-level components
- **Components** - Reusable UI components organized by domain
- **Features** - Self-contained feature modules
- **Services** - API and external service integrations
- **Utils** - Pure utility functions
- **Hooks** - Custom React hooks
- **Context** - Global state providers

## Directory Structure

```
src/
├── pages/                          # Full page components (route destinations)
│   ├── Home/                       # Home page
│   ├── Menu/                       # Food and drinks menu pages
│   ├── Products/                   # Product detail pages
│   ├── Checkout/                   # Checkout flow
│   ├── Info/                       # About, Contact, Delivery, etc.
│   ├── Dashboard/                  # Admin dashboard
│   ├── Auth/                       # Login/Register
│   └── NotFound/                   # 404 page
│
├── components/                     # Reusable components
│   ├── layout/                     # Layout components
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── Hero/
│   ├── products/                   # Product-related components
│   │   ├── ProductCard/
│   │   └── ProductGrid/
│   ├── cart/                       # Shopping cart
│   │   └── Cart/
│   ├── social/                     # Social media integrations
│   │   └── InstagramFeed/
│   ├── seo/                        # SEO components
│   │   └── SEO/
│   └── common/                     # Shared components
│       ├── Button/
│       ├── Card/
│       └── LoadingSpinner/
│
├── features/                       # Feature modules
│   ├── workshops/                  # Workshop management feature
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── reservations/               # (Future) Table reservations
│   └── loyalty/                    # (Future) Loyalty program
│
├── context/                        # React Context providers
│   ├── AuthContext.js
│   └── CartContext.js              # (Planned)
│
├── hooks/                          # Custom React hooks
│   ├── useAuth.js
│   ├── useCart.js
│   └── useLocalStorage.js
│
├── services/                       # External services
│   ├── api/                        # API functions
│   ├── supabase/                   # Supabase client
│   │   └── supabaseClient.js
│   └── analytics/                  # Analytics tracking
│
├── utils/                          # Utility functions
│   ├── gumlet.js                   # Image CDN utilities
│   ├── whatsapp.js                 # WhatsApp integration
│   ├── seoData.js                  # SEO configuration
│   ├── sitemapGenerator.js         # Sitemap generation
│   └── formatters.js               # Formatting utilities
│
├── data/                           # Static data
│   ├── products.js                 # Product catalog
│   └── constants.js                # App constants
│
├── styles/                         # Global styles
│   ├── App.css                     # Main stylesheet
│   ├── variables.css               # CSS custom properties
│   └── typography.css              # Font definitions
│
├── assets/                         # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── config/                         # Configuration
│   ├── routes.js
│   └── environment.js
│
├── App.js                          # Root component
└── index.js                        # Entry point
```

## Key Principles

### 1. Separation of Concerns

- **Pages** contain routing logic and page composition
- **Components** are reusable and domain-specific
- **Features** are self-contained with their own components, hooks, and utils
- **Services** handle all external API calls
- **Utils** are pure functions with no side effects

### 2. Colocation

Related files should be close together:
- Each component lives in its own folder
- Component-specific CSS lives next to the component
- Feature-specific code stays within the feature folder

### 3. Clear Naming

- Pages: `[Name]Page.js` (e.g., `FoodMenuPage.js`)
- Components: `[Name].js` (e.g., `ProductCard.js`)
- Hooks: `use[Name].js` (e.g., `useCart.js`)
- Utils: `[descriptiveName].js` (e.g., `formatters.js`)

## Where to Put New Code

### Adding a New Page

```
src/pages/NewPage/
├── NewPage.js
├── NewPage.css
└── components/      # Page-specific components (if any)
```

Then add route in `App.js`:
```javascript
import NewPage from "./pages/NewPage/NewPage";
// ...
<Route path="/new-page" element={<NewPage />} />
```

### Adding a Reusable Component

```
src/components/[domain]/ComponentName/
├── ComponentName.js
├── ComponentName.css
└── ComponentName.test.js (optional)
```

Example domains: `layout`, `products`, `cart`, `common`

### Adding a New Feature

```
src/features/feature-name/
├── components/          # Feature-specific components
├── hooks/              # Feature-specific hooks
├── utils/              # Feature-specific utilities
├── services/           # Feature-specific API calls (optional)
└── README.md           # Feature documentation
```

### Adding a Utility Function

```javascript
// src/utils/[categoryName].js

/**
 * Utility function description
 * @param {type} paramName - param description
 * @returns {type} return description
 */
export function utilityName(param) {
  // implementation
}
```

### Adding a Custom Hook

```javascript
// src/hooks/useSomething.js

import { useState, useEffect } from 'react';

/**
 * Hook description
 * @returns {Object} Hook state and methods
 */
export function useSomething() {
  // hook logic
  return { /* exported state/methods */ };
}
```

### Adding an API Service

```javascript
// src/services/api/entityName.js

import { supabase } from '../supabase/supabaseClient';

export const entityService = {
  async getAll() {
    // implementation
  },

  async create(data) {
    // implementation
  },

  // ... other CRUD operations
};
```

## Import Conventions

### Absolute vs Relative Imports

Use relative imports based on proximity:

```javascript
// From pages
import Header from "../../components/layout/Header/Header";
import { products } from "../../data/products";

// From components
import ProductCard from "../ProductCard/ProductCard";
import { formatPrice } from "../../../utils/formatters";

// From features
import { workshopService } from "../../services/api/workshops";
```

### Import Organization

Order imports by type:

```javascript
// 1. React and third-party libraries
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Components
import Header from './components/layout/Header/Header';
import ProductCard from './components/products/ProductCard/ProductCard';

// 3. Hooks and Context
import { useAuth } from './context/AuthContext';
import { useCart } from './hooks/useCart';

// 4. Services and Utils
import { workshopService } from './services/api/workshops';
import { formatPrice } from './utils/formatters';

// 5. Data and Constants
import { products } from './data/products';

// 6. Styles
import './App.css';
```

## Examples

### Example 1: Creating a New Menu Item Feature

1. **Add the product data** to `src/data/products.js`
2. **Create a product detail page** (if needed):
   ```
   src/pages/Products/ProductDetailPage.js
   ```
3. **Use existing components**:
   - `ProductCard` for display
   - `Cart` for adding to cart
   - `SEO` for metadata

### Example 2: Adding Table Reservations Feature

```
src/features/reservations/
├── components/
│   ├── ReservationForm/
│   │   ├── ReservationForm.js
│   │   └── ReservationForm.css
│   └── ReservationList/
│       ├── ReservationList.js
│       └── ReservationList.css
├── hooks/
│   └── useReservations.js
├── services/
│   └── reservationService.js
└── README.md
```

Then create a page:
```
src/pages/Reservations/
├── ReservationsPage.js
└── ReservationsPage.css
```

### Example 3: Adding a Loading Spinner Component

```
src/components/common/LoadingSpinner/
├── LoadingSpinner.js
└── LoadingSpinner.css
```

```javascript
// LoadingSpinner.js
import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 'medium' }) {
  return <div className={`spinner spinner-${size}`} />;
}
```

Use it anywhere:
```javascript
import LoadingSpinner from 'components/common/LoadingSpinner/LoadingSpinner';

function MyComponent() {
  return loading ? <LoadingSpinner /> : <Content />;
}
```

## Best Practices

### Do's

- ✅ Keep components small and focused
- ✅ Colocate related files
- ✅ Use descriptive names
- ✅ Document complex logic
- ✅ Write reusable components
- ✅ Separate concerns (UI, logic, data)

### Don'ts

- ❌ Don't create deeply nested folder structures
- ❌ Don't mix pages and components
- ❌ Don't put business logic in components
- ❌ Don't create giant utility files
- ❌ Don't skip documentation for features

## Migration Notes

If you're working with legacy code from the old structure:
- Old components in `src/components/` (flat) → Now organized by domain
- Old `lib/supabaseClient.js` → Now in `services/supabase/`
- Pages were mixed with components → Now in separate `pages/` directory

## Questions?

For questions about where to put new code, refer to:
1. This document
2. README files in each major folder
3. Existing similar features as examples

---

**Last Updated:** 2025-12-02
**Maintainer:** Development Team
