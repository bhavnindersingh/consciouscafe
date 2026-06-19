# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based platform for Conscious Sanctuary, featuring workshops, events, and retreats with a facilitator dashboard. The platform includes an e-commerce menu for the cafe, product browsing, cart functionality, checkout process, facilitator management dashboard, and comprehensive SEO optimization.

## Development Commands

### Core Development Commands
- `npm start` - Start development server (USER WILL START MANUALLY - DO NOT RUN)
- `npm run build` - Build for production
- `npm test` - Run tests (React Testing Library)

### Deployment
- Deployed on Netlify with automatic builds from Git
- Build configuration in `netlify.toml`
- Node.js version 18 required for deployment

## Architecture Overview

### Repository Structure
The application follows a scalable, feature-based organization:

```
src/
├── pages/              # Route-level page components
├── components/         # Reusable UI components (organized by domain)
├── features/           # Self-contained feature modules
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── services/           # API and external service integrations
├── utils/              # Utility functions
├── data/               # Static data and constants
├── styles/             # Global styles
├── assets/             # Static assets
└── config/             # Configuration files
```

### Component Organization

- **pages/** - Full page components for each route:
  - `Home/`, `Menu/`, `Products/`, `Checkout/`, `Info/`, `Dashboard/`, `Auth/`, `NotFound/`

- **components/** - Reusable components organized by domain:
  - `layout/` - Header, Footer, Hero
  - `products/` - ProductCard, ProductGrid
  - `cart/` - Cart component
  - `social/` - InstagramFeed
  - `seo/` - SEO component
  - `common/` - Shared components (Button, Card, LoadingSpinner)

- **features/** - Self-contained feature modules:
  - `workshops/` - Workshop management (components, hooks, utils)
  - `reservations/` - (Planned) Table reservations
  - `loyalty/` - (Planned) Loyalty program

- **services/** - External service integrations:
  - `api/` - API endpoint functions
  - `supabase/` - Supabase client configuration
  - `analytics/` - Analytics tracking

### State Management
- Local React state for cart management with localStorage persistence
- Cart state managed in `App.js` and passed down to components
- Product navigation using React Router with dynamic URLs

### Data Structure
- **products.js** - Centralized product data with categories, pricing, descriptions, and images
- Categories: Toast, All Day Breakfast, Smoothie Bowls, Earth Grills/Crisps, Salads, Platters, Earth Bowls, Noodle Bowls, Pasta/Pizza, Desserts
- Drink categories managed separately in drink menu components

### Routing Architecture
- React Router v6 with slug-based product URLs
- Category-based navigation: `/category/:categoryId`
- Product detail pages: `/product/:productSlug`
- Menu pages: `/menu` (food), `/drinks` (beverages)
- Static pages: `/about`, `/contact`, `/delivery`

## SEO Implementation

### Comprehensive SEO Setup
The site includes extensive SEO optimization:

- **react-helmet-async** for dynamic meta tags
- **Structured Data**: Restaurant, LocalBusiness, MenuItem, BreadcrumbList schemas
- **Product Pages**: Individual SEO optimization for each menu item
- **Social Media**: Open Graph and Twitter Card tags

### SEO Architecture
- **components/seo/SEO/SEO.js** - Reusable SEO component
- **utils/seoData.js** - Centralized SEO configuration and structured data
- **utils/sitemapGenerator.js** - Sitemap generation utilities

### Configuration Requirements
Update actual business information in `src/utils/seoData.js`:
- Business address and coordinates
- Phone number and email
- Domain URL (currently placeholder)

## Styling Architecture

### CSS Organization
- **App.css** - Main stylesheet with responsive design
- Component-specific styles integrated within the main CSS file
- Mobile-first responsive design with breakpoints at 768px and 480px

### Key Style Features
- Custom CSS Grid layouts for product displays
- Gumlet CDN integration for optimized media delivery (images and video)
- Hardware acceleration for smooth animations
- Comprehensive mobile responsiveness

## Known Issues & Fixes

### Deployment-Specific Issues
- **CSS Build Failures**: Invalid CSS syntax can break Netlify builds - ensure proper CSS comment syntax
- **Mobile Responsiveness**: Production builds may lose responsive styles if CSS syntax errors occur
- **Hero Video**: Gumlet video iframe embed with proper z-index layering for content visibility

### Development vs Production Differences
- CSS minifier in production is more strict than development server
- Media queries can be lost during build if CSS syntax errors exist
- Z-index conflicts may appear differently in production

## Gumlet CDN Integration

The application uses Gumlet CDN for all media delivery:
- **Images**: Optimized delivery with automatic format conversion (WebP, AVIF) via `gumlet.js` utility
- **Video**: Hero section uses Gumlet video player with iframe embed for efficient streaming
- **Configuration**: Gumlet base URL set in `.env.local` (REACT_APP_GUMLET_BASE_URL)
- **Parameters**: Image transformations include width, height, quality, format, and crop mode

### Gumlet Utility (`src/utils/gumlet.js`)
- **getGumletUrl()**: Generates optimized URLs with transformation parameters
- **gumletPresets**: Predefined optimization presets for different use cases
- **getResponsiveImageSet()**: Creates srcset for responsive images
- **Important**: Uses `fm` parameter (not `format`) for format transformations

## Data Management

### Product Data Structure
Products include:
- Categories and subcategories
- Pricing (including dietary-specific prices)
- Nutritional information
- Image URLs (Gumlet CDN with transformations)
- SEO-optimized descriptions

### Cart Functionality
- localStorage persistence
- Quantity management
- Checkout integration
- WhatsApp ordering system (utility in `src/utils/whatsapp.js`)

## Critical Development Notes

- **NEVER run `npm start` automatically** - User will start the development server manually when needed
- Always run builds locally before deployment to catch CSS syntax errors
- Product URLs are auto-generated from product names using slug conversion
- Category definitions in `App.js` must match product categories in `data/products.js`
- SEO data should be updated with actual business information before production use

## Adding New Features

### Quick Reference

- **New Page** → `src/pages/PageName/PageName.js`
- **Reusable Component** → `src/components/[domain]/ComponentName/ComponentName.js`
- **New Feature Module** → `src/features/feature-name/`
- **API Integration** → `src/services/api/entityName.js`
- **Utility Function** → `src/utils/[categoryName].js`
- **Custom Hook** → `src/hooks/useSomething.js`
- **Global State** → `src/context/SomethingContext.js`

### Authentication & Database

- **Auth**: Supabase authentication via `context/AuthContext.js`
- **Database**: Supabase client at `services/supabase/supabaseClient.js`
- **Offerings Management**: Facilitator dashboard at `/dashboard` for creating/managing workshops, events, and retreats
- **RSVP System**: Complete RSVP management with approval workflow
- **Login**: `/login` route for authentication
- **Protected Routes**: Dashboard routes require authentication
- **Supabase project**: single project `hxpbrlqclyujirspuuav` (auth, dashboard & menu); the public anon key is the default in `services/supabase/supabaseClient.js`, overridable via `REACT_APP_SUPABASE_URL` / `REACT_APP_SUPABASE_ANON_KEY`