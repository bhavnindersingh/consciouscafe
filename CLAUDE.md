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
- **The menu is live from Supabase — there is no static product file.** `hooks/useDeliveryMenu.js` → `services/menuService.js` reads `recipes` where `is_production_recipe = true` on every page load, and `toProduct()` maps a POS row to the shape components consume.
- The same Supabase project backs the POS (`Manager Conscious Cafe`), so a name, description, price, category, dietary label or variation edited in the POS appears on the site immediately — no rebuild.
- **Photos are the exception** — see "Dish Photos" below.
- Categories come from `recipes.category` / `sub_category`, slugged. They are not hardcoded here.

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

## Dish Photos

**Changing a dish photo in the POS does not change it on the website.** POS uploads are downscaled to 600px at WebP q0.60 (`Manager Conscious Cafe/frontend/src/utils/imageUtils.js`) — right for a POS tile, far too small for the 1800×2400 detail panel or the 2000×1120 full-bleed hero. So the curated shoots in `public/images/menu-photos/{food,drinks}/` are the real source:

- `src/data/imageMap.js` maps **`recipes.sku` → photo path**. `menuService.toProduct()` looks up `IMAGE_MAP[recipe.sku]`; when it hits, all three sizes are generated through Gumlet. `recipes.image_url` is only the fallback when a dish has no curated photo.
- **Keyed by SKU on purpose.** A SKU is assigned once by a `BEFORE INSERT` trigger and is read-only in the POS recipe form, so renaming a dish cannot silently detach its photo. Do not re-key this by name. (No DB constraint forbids an `UPDATE` to `sku`; nothing in the app issues one, and `check:images` fails loudly if one ever happens.)
- `hasLocalImage` tells consumers whether they hold a real Gumlet photo. Gate anything full-bleed on it — the fallback is a 600px image that pixelates when stretched (`LandingPage.js` does this for its hero).

### Run `npm run check:images` after touching any of this

It validates all three joins that can rot silently — nothing throws, a photo just quietly vanishes:

| Join | Breaks when |
|---|---|
| `IMAGE_MAP` key → `recipes.sku` | dish retired |
| `IMAGE_MAP` value → file in `public/` | typo, or **case mismatch** (`.JPG`/`.jpg` — works locally, 404s on Netlify) |
| `landingPages.json` `highlights` → `recipes.name` | **dish renamed in the POS** (still name-matched, silently `.filter(Boolean)`-ed away) |
| `toSlug(recipes.name)` uniqueness | two POS dishes slug to the same `/product/` URL — one page silently unreachable |

It also warns on **undersized photos** (mapped JPEGs narrower than the 1800px detail panel — Gumlet won't upscale, they render soft) and on SKU whitespace/case drift. The SKU join itself is whitespace/case-tolerant on both sides (`menuService.js` `normSku` mirrors the script), so drift can no longer detach a photo — it's just reported for cleanup.

Exits 1 on a real break; missing photos and unreferenced files are warnings. Not wired into `prebuild` — it needs network and a Supabase blip must never break a deploy.

### Supabase outage → stale menu, not a blank page
`useDeliveryMenu` caches the last good menu in localStorage (`cc_menu_cache_v1`). If the live fetch fails, returning visitors get the cached menu with `stale: true` instead of an error; `error` is only set when there's nothing cached (first-ever visit during an outage).

### Replacing a photo needs a new filename

`netlify.toml` serves `/images/*` as `max-age=31536000, immutable` with Gumlet caching on top. Dropping a new file in at the same name keeps serving the old picture. Give it a different filename and update `imageMap.js`. (The POS fallback path is immune by accident — `uploadImage()` mints a random filename per upload.)

### Product fields
`toProduct()` returns: `id`, `name`, `description`, `price`, `mainCategory`, `category`, `image` / `imageDetail` / `imageHero`, `hasLocalImage`, `sku`, `taxRate`, `dietaryLabels`, `variations[]`.

## Cart Functionality
- localStorage persistence
- Quantity management
- Checkout integration
- WhatsApp ordering system (utility in `src/utils/whatsapp.js`)

## Critical Development Notes

- **NEVER run `npm start` automatically** - User will start the development server manually when needed
- Always run builds locally before deployment to catch CSS syntax errors
- Product URLs are auto-generated from product names using slug conversion
- Category definitions in `App.js` must match the POS values in `recipes.category` / `sub_category` (slugged) — categories are not defined in this repo
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