# Conscious Café — redesign as real React components

These are **buildable ES-module React components** (not the preview prototype). They use `react` + `react-router-dom@6` and standard imports — no in-browser Babel, no CDN, no `window` globals. Drop the folder into your app's `src/` and wire the routes.

## Why this exists
The HTML prototype ran on in-browser Babel and script-tag globals, so it couldn't be built or ported cleanly — pages got lost in re-implementation. This folder is the same design, converted to components you can actually compile.

## Requirements
- React 17+ (uses the classic JSX runtime / `import React`)
- `react-router-dom` v6 — `npm i react-router-dom`

## What's inside
```
ConsciousApp.jsx        Standalone app (BrowserRouter + CartProvider + routes) — run this to see it whole
ConsciousLayout.jsx     Nav + MobileMenu + Footer + CartDrawer + Toast around an <Outlet/>
nav.js                  useGoNav() — maps nav clicks to react-router navigation
cart/CartContext.jsx    CartProvider + useCart() (cart, toast, bag-drawer state)
data/menu.js            Real menu data + image/helpers (CC.*). Mirrors your src/data/products.js
styles/conscious.css    ALL design tokens + styling (one file, import once)
assets/                 hibiscus.png, founder-bhavninder.png
components/
  primitives.jsx        Reveal, Arrow, BagIcon
  Nav.jsx  MobileMenu.jsx  CartDrawer.jsx  Footer.jsx  Toast.jsx
  SanctuaryModal.jsx    Waitlist / Notify / Host modal (front-end only)
pages/
  Home.jsx  Menu.jsx  Dish.jsx  Story.jsx  Visit.jsx
```

## Fastest way to see it work
1. Copy this whole folder into `src/conscious/`.
2. Render `<ConsciousApp/>` from your entry (or a sandbox route). It self-contains a `BrowserRouter` + `CartProvider`.
3. `npm i react-router-dom` if you don't have it, then start the dev server.

## Integrating into your EXISTING app/router
You already have a `<BrowserRouter>` in `index.js`/`App.js`. So **don't** use the nested `BrowserRouter` from `ConsciousApp` — instead:
1. Wrap your routed tree in `<CartProvider>` (from `cart/CartContext`).
2. Add the routes from `ConsciousRoutes` (in `ConsciousApp.jsx`) into your `<Routes>`:
   ```jsx
   <Route element={<ConsciousLayout />}>
     <Route path="/" element={<Home />} />
     <Route path="/menu" element={<Menu />} />
     <Route path="/menu/:id" element={<Dish />} />
     <Route path="/story" element={<Story />} />
     <Route path="/visit" element={<Visit />} />
   </Route>
   ```
3. `import "./conscious/styles/conscious.css";` once (e.g. in the entry).

### Mapping Story to your existing `/about`
The app already has an `/about` page (`src/pages/Info/AboutUs.js`). To replace it with this Story design:
- change the Story route `path` to `/about`,
- in `nav.js` change the `"story"` case to `navigate("/about")`,
- remove the old `AboutUs` route + component.

## Data
`data/menu.js` carries the real catalogue (the same items/prices as `src/data/products.js`) plus the `CC` helper object the components use (`CC.img`, `CC.find`, `CC.byCategory`, …). If you'd rather use your existing `src/data/products.js` + `src/utils/gumlet.js`, you can: just keep the `CC` helper shape and point it at your data. The `img()` helper here mirrors `getGumletUrl`.

## Fonts
Load these (Google Fonts) in `public/index.html` — your app already does:
EB Garamond, Cormorant Garamond, Inter.

## Things deliberately left for you
- **The three Sanctuary forms are front-end only.** Wire `SanctuaryModal`'s submit to a real endpoint/email/CRM.
- **Cart "Proceed to Checkout"** is a stub — connect to your checkout.
- **Tweaks panel** from the prototype is intentionally omitted (it was a design tool).

## Note
This was converted file-by-file from the working prototype and is structured to compile, but it has **not** been run through your build here. Run the dev server / linter once and fix any import-path nits for your folder location (the imports assume the folder layout above).

## Checklist — confirm all render
- [ ] `/` Home (hero video, signatures, sanctuary CTAs)
- [ ] `/menu` Menu (Food / Drinks groups)
- [ ] `/menu/:id` Dish detail (add to bag works)
- [ ] `/story` Story (4 founders, values)
- [ ] `/visit` Visit (hours, map)
- [ ] Nav, mobile menu, cart drawer, toast, Sanctuary modal
