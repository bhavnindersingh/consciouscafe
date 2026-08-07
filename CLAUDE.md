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

### What the website is allowed to sell

The site is delivery-only, so the POS's **"Available for Delivery"** switch (`recipes.available_for_delivery`) decides what appears — `isWebsiteSellable()` in `menuService.js`, applied by `useDeliveryMenu()`. Flip the switch in the POS and the dish appears or disappears on the next load. Add-on categories (`ADDON_CATEGORIES` — currently `Extras`) are excluded too: they're counter add-ons, not standalone products.

Two consequences worth knowing before wondering where a dish went:

- `useDeliveryMenu('all')` opts out of the gate. **The print menu uses it** — the printed in-cafe menu is the whole kitchen, not just what travels.
- `scripts/generate-seo.js` mirrors the same filter. It must, or the sitemap publishes `/product/` URLs that 404.

Run **`npm run check:menu`** after touching any of this, or when a dish is missing from the site. It reads the live POS and reports every join this repo layers on top: dishes the delivery switch hides (with a per-category roll-up), landing-page highlights pointing at hidden or renamed dishes, `CATEGORY_META` drift in both directions, categories with no packaging rate, and dietary labels the site can't render. Exits 1 only on real breaks — a highlight naming a dish that no longer exists, an unnamed section, an unrenderable label. Hidden dishes are warnings, including a landing page emptied by the delivery switch: that's a decision, not a defect, and a check that goes red on a correct tree is a check people learn to ignore. Like `check:images`, it isn't wired into `prebuild` — it needs network, and a Supabase blip must never break a deploy.

### POS columns the site deliberately ignores

- `website_menu_ready`, `qr_menu_ready`, `print_menu_ready` — in the schema and in RecipeForm's save payload, but **no POS UI toggles them** and `website_menu_ready` is false on every row. Gating on it would empty the site.
- `delivery_markup` — null on every row, and the POS's own Delivery Pricing Matrix computes markup from platform commissions, not this column.
- `delivery_image_url` — the delivery-platform photo, unpopulated; site photos come from `imageMap.js`.
- `tax_rate` — 5% on every row, and the POS charges a flat 5% regardless, so `toProduct` exposes `taxRate` but the bill uses the flat rate (see `utils/totals.js`).
- `platform_pricing` / `waive_delivery_packaging` — Swiggy/Zomato economics and pricing-matrix margin, not the customer's bill.

### Seams that have no code fix

- **Stock.** Nothing in the POS marks a dish 86'd, so the site can sell something the kitchen has run out of. Would need a POS feature first.
- **Orders.** Checkout opens WhatsApp; it writes no `orders` row. Staff re-punch into the POS, so the site's total is a quote the POS re-derives — which is why `utils/totals.js` must match the POS arithmetic exactly.

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
- When it's false, the dish renders a **`<PhotoPending>`** badge over the picture (`components/common/PhotoPending`) on every surface — menu card, product detail, landing highlight, homepage signature. The POS photo still shows so the customer sees the dish; the badge makes the gap visible on the live site instead of leaving a quietly soft card. It renders nothing when the dish has its proper photo, so drop it in unconditionally.

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

### The bill lives in one place — `src/utils/totals.js`

Checkout renders the bill and the WhatsApp message repeats it; both call `calcTotals(cartItems, rates)`. Never recompute a total anywhere else — the checkout drawer and the message the cafe bills from must agree. (`CartContext` deliberately exposes no `gst`/`total` for this reason.)

It mirrors the POS (`Manager Conscious Cafe`, `services/orderService.js`) exactly, verified against live orders:

- **packaging** = Σ qty × rate for every line, rounded to 2dp. Every website order is a delivery, so every dish is packed — in the POS that's the per-item `needs_packaging` flag (auto-on for takeaway); here it's implicit.
- **GST** = `2 × round₂((subtotal + packaging) × 2.5%)` — the CGST/SGST split, *not* a flat 5%, which is off by a paisa on some totals.

Rates are live from `app_settings.packaging_charges` in Supabase (`getPackagingRates()` → `usePackagingRates()`), a `{ raw recipes.category: ₹ }` map editable in the POS Settings — a rate change lands with no rebuild. Lookup is by raw `posCategory` first (so the site's number is the POS's number), slug second (for carts saved in localStorage before `posCategory` existed). **A category absent from the map packs free** — `Extras` currently does. That's a POS settings edit, not site code.

**Never cache these rates.** Unlike the menu, where a minutes-old price beats a blank page, a rate here is money on a bill the cafe has to honour — a stale copy bills what the POS no longer charges. `usePackagingRates(isOpen)` refetches on every checkout open (with one retry), so a rate edited in the POS applies to the very next order even in a long-open tab. When the fetch fails, `packaging` is `null`, not `0`: the drawer relabels its footer "Subtotal + GST" and both it and the WhatsApp message say packaging is confirmed on the order.

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