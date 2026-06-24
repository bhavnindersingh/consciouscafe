/* eslint-disable no-console */
/**
 * Postbuild SEO generator.
 *
 * Runs after `react-scripts build`. It:
 *   1. Generates per-route static HTML by cloning the built index.html and
 *      swapping in route-specific <title>, description, canonical and OG/Twitter
 *      tags (+ JSON-LD). This gives non-JS crawlers (WhatsApp, Facebook,
 *      Instagram, LinkedIn, Slack, bingbot…) correct per-page link previews —
 *      something a pure SPA can't do client-side.
 *   2. Regenerates build/sitemap.xml from the live menu (Supabase) so every
 *      dish has an entry with the correct slug URL.
 *
 * It is intentionally resilient: if Supabase is unreachable at build time it
 * still writes the static-route HTML + a stable-route sitemap and exits 0, so
 * a network blip never breaks the deploy.
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const LANDING_PAGES = require('../src/data/landingPages.json');

const SITE = 'https://consciouscafe.in';
const BUILD = path.join(__dirname, '..', 'build');
const TEMPLATE_PATH = path.join(BUILD, 'index.html');

const SUPABASE_URL =
  process.env.REACT_APP_SUPABASE_URL || 'https://hxpbrlqclyujirspuuav.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cGJybHFjbHl1amlyc3B1dWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNDEzMTMsImV4cCI6MjA3NDYxNzMxM30.-0RMrh1IJLTztyfe-O0lYclVekcCYQA30cu53ZNTbZg';

// Mirror of src/utils/slug.js — keep in sync.
const toSlug = (str = '') =>
  (str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const today = new Date().toISOString().slice(0, 10);

// Pretty section names (mirror of src/utils/menuEnrichment.js CATEGORY_META).
const SECTION_NAMES = {
  'toast': 'Toast',
  'all-day-breakfast': 'All Day Breakfast',
  'smoothie-bowls': 'Smoothie Bowls',
  'earth-grills-crisps': 'Earth Grills & Crisps',
  'salads': 'Salads',
  'platters': 'Platters',
  'earth-bowls': 'Earth Bowls',
  'noodle-bowls': 'Noodle Bowls',
  'pasta-pizza': 'Pasta',
  'pasta': 'Pasta',
  'desserts': 'Desserts',
  'juices': 'Juices',
  'mocktails': 'Mocktails',
  'floral-teas': 'Floral Teas',
  'chai': 'Chai',
  'coffee': 'Coffee',
};
const SECTION_ORDER = [
  'toast', 'all-day-breakfast', 'smoothie-bowls', 'earth-grills-crisps',
  'salads', 'platters', 'earth-bowls', 'noodle-bowls', 'pasta-pizza', 'pasta',
  'desserts', 'juices', 'mocktails', 'floral-teas', 'chai', 'coffee',
];
const titleCase = (slug = '') => slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

// FAQ (mirror of src/utils/seoData.js FAQS) — rendered visibly on /visit.
const FAQS = [
  { q: 'Is Conscious Cafe vegetarian and vegan?', a: 'Yes — our entire menu is vegetarian, with a large selection of vegan dishes clearly labelled. Everything is plant-forward and made in-house with consciously sourced, non-processed ingredients.' },
  { q: 'Where is Conscious Cafe located?', a: "We're at Kavas Yoga Retreat on Kuilapalayam Main Road (Auroville Road), Auroville, Tamil Nadu 605101 — a short drive from Pondicherry." },
  { q: 'What are your opening hours?', a: "We're open Wednesday to Monday, 9:30am to 9:00pm, and closed on Tuesdays." },
  { q: 'Do you offer food delivery in Auroville?', a: 'Yes — we deliver fresh vegetarian & vegan meals across Auroville and nearby areas. You can order online through our website.' },
  { q: 'Do I need a reservation?', a: "No reservation is needed — walk in any time during opening hours and we'll find you a seat." },
];
const faqSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

// ── Stable routes (title/description mirror src/utils/seoData.js) ──────────────
const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly',
    title: 'Conscious Cafe Auroville | Best Vegetarian & Vegan Restaurant with Ice Bath, Sauna, Yogashala',
    description: 'Experience artisanal vegetarian & vegan food at Conscious Cafe Auroville. Fresh, consciously sourced non-processed meals with conscious ingredients at Kavas Yoga Retreat. Order online now!' },
  { path: '/menu', priority: '0.9', changefreq: 'weekly',
    title: 'Vegetarian & Vegan Food Menu | Conscious Cafe Auroville',
    description: 'Browse our artisanal vegetarian & vegan menu featuring toasts, bowls, salads & desserts. Fresh, consciously sourced non-processed ingredients. Best healthy restaurant in Auroville!' },
  { path: '/menu/food', priority: '0.8', changefreq: 'weekly',
    title: 'Food Menu — Toasts, Bowls, Salads & More | Conscious Cafe Auroville',
    description: 'Our all-day vegetarian & vegan food menu: artisanal toasts, smoothie bowls, salads, earth bowls, pasta & desserts. Consciously sourced, made in-house in Auroville.' },
  { path: '/menu/drinks', priority: '0.8', changefreq: 'weekly',
    title: 'Drinks Menu — Coffee, Shakes, Smoothies & Teas | Conscious Cafe Auroville',
    description: 'Explore our drinks: specialty coffee, health shakes, smoothies, cold pressed juices, kombucha & herbal teas. Plant-based and consciously made in Auroville.' },
  { path: '/menu/patisserie', priority: '0.8', changefreq: 'weekly',
    title: 'Patisserie — Cakes, Bakes & Desserts | Conscious Cafe Auroville',
    description: 'Freshly baked vegetarian & vegan patisserie — cakes, tarts, cookies and desserts made in-house with consciously sourced ingredients in Auroville.' },
  { path: '/about', priority: '0.7', changefreq: 'monthly',
    title: 'About Conscious Cafe | Sustainable Dining Auroville',
    description: "Discover Conscious Cafe Auroville's mission of sustainable, conscious eating. Located at Kavas Yoga Retreat, we serve artisanal vegetarian & vegan food with love." },
  { path: '/visit', priority: '0.7', changefreq: 'monthly',
    title: 'Visit Us — Location, Hours & Sanctuary | Conscious Cafe Auroville',
    description: 'Visit Conscious Cafe at Kavas Yoga Retreat, Auroville Road. Find our hours, directions, and the sanctuary — ice bath, sauna and yogashala. Open Wed–Mon, 9:30am–9pm.' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly',
    title: 'Contact & Location | Conscious Cafe Auroville',
    description: 'Visit Conscious Cafe at Kavas Yoga Retreat, Auroville. Get directions, hours, phone & reservation info. Best vegetarian & vegan restaurant in Auroville Tamil Nadu.' },
  { path: '/delivery', priority: '0.6', changefreq: 'monthly',
    title: 'Food Delivery Auroville | Conscious Cafe Online Order',
    description: 'Order healthy vegetarian & vegan food delivery from Conscious Cafe Auroville. Fresh, consciously sourced non-processed meals delivered to your door. Serving Auroville and nearby areas.' },
  { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly',
    title: 'Privacy Policy | Conscious Cafe Auroville',
    description: 'Privacy Policy for Conscious Cafe, Auroville. Learn how we collect, use, and protect your personal information.' },
  { path: '/terms-of-service', priority: '0.3', changefreq: 'yearly',
    title: 'Terms of Service | Conscious Cafe Auroville',
    description: 'Terms of Service for Conscious Cafe, Auroville. Our policies for dining, delivery, and online ordering.' },
];

// ── Tag rewriting ──────────────────────────────────────────────────────────
function rewrite(template, { url, title, description, schemas }) {
  const t = esc(title);
  const d = esc(description);
  const u = esc(url);
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
    .replace(/<meta name="description" content="[^"]*"\/>/, `<meta name="description" content="${d}"/>`)
    .replace(/<link rel="canonical" href="[^"]*"\/>/, `<link rel="canonical" href="${u}"/>`)
    .replace(/<meta property="og:title" content="[^"]*"\/>/, `<meta property="og:title" content="${t}"/>`)
    .replace(/<meta property="og:description" content="[^"]*"\/>/, `<meta property="og:description" content="${d}"/>`)
    .replace(/<meta property="og:url" content="[^"]*"\/>/, `<meta property="og:url" content="${u}"/>`)
    .replace(/<meta property="og:image:alt" content="[^"]*"\/>/, `<meta property="og:image:alt" content="${t}"/>`)
    .replace(/<meta name="twitter:title" content="[^"]*"\/>/, `<meta name="twitter:title" content="${t}"/>`)
    .replace(/<meta name="twitter:description" content="[^"]*"\/>/, `<meta name="twitter:description" content="${d}"/>`);

  if (schemas && schemas.length) {
    const blocks = schemas
      .map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
      .join('');
    html = html.replace('</head>', `${blocks}</head>`);
  }
  return html;
}

function writeRouteHtml(routePath, html) {
  // '/' is the template itself — leave build/index.html untouched.
  if (routePath === '/') return;
  const rel = routePath.replace(/^\//, '');
  const file = path.join(BUILD, `${rel}.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);

  // '/menu' collides with the menu/ directory (it holds food/drinks/patisserie).
  // Emit menu/index.html too so the route resolves correctly whether the host
  // serves menu.html or looks for menu/index.html.
  if (routePath === '/menu') {
    fs.mkdirSync(path.join(BUILD, rel), { recursive: true });
    fs.writeFileSync(path.join(BUILD, rel, 'index.html'), html);
  }
}

const crumb = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE}${it.path}`,
  })),
});

function crumbsFor(routePath) {
  const labels = {
    '/menu': [{ name: 'Home', path: '/' }, { name: 'Menu', path: '/menu' }],
    '/menu/food': [{ name: 'Home', path: '/' }, { name: 'Menu', path: '/menu' }, { name: 'Food', path: '/menu/food' }],
    '/menu/drinks': [{ name: 'Home', path: '/' }, { name: 'Menu', path: '/menu' }, { name: 'Drinks', path: '/menu/drinks' }],
    '/menu/patisserie': [{ name: 'Home', path: '/' }, { name: 'Menu', path: '/menu' }, { name: 'Patisserie', path: '/menu/patisserie' }],
    '/about': [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }],
    '/visit': [{ name: 'Home', path: '/' }, { name: 'Visit', path: '/visit' }],
    '/contact': [{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }],
    '/delivery': [{ name: 'Home', path: '/' }, { name: 'Delivery', path: '/delivery' }],
  };
  return labels[routePath] ? [crumb(labels[routePath])] : [];
}

function buildSitemap(urls) {
  const body = urls
    .map(u => `  <url>\n    <loc>${SITE}${u.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

async function fetchProducts() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase
    .from('recipes')
    .select('id, name, description, selling_price, category, sub_category')
    .eq('is_production_recipe', true)
    .order('name');
  if (error) throw error;
  return (data || [])
    .map(r => ({
      slug: toSlug(r.name),
      name: r.name,
      description: r.description || '',
      price: parseFloat(r.selling_price) || 0,
      section: toSlug(r.sub_category || r.category),
    }))
    .filter(p => p.slug);
}

// Full Menu schema (Restaurant menu rich results) grouped into sections.
function buildMenuSchema(products) {
  const bySection = {};
  for (const p of products) {
    (bySection[p.section] = bySection[p.section] || []).push(p);
  }
  const sectionKeys = Object.keys(bySection).sort((a, b) => {
    const ai = SECTION_ORDER.indexOf(a), bi = SECTION_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${SITE}/menu#menu`,
    name: 'Conscious Cafe Menu',
    url: `${SITE}/menu`,
    inLanguage: 'en',
    hasMenuSection: sectionKeys.map(key => ({
      '@type': 'MenuSection',
      name: SECTION_NAMES[key] || titleCase(key),
      hasMenuItem: bySection[key].map(p => ({
        '@type': 'MenuItem',
        name: p.name,
        ...(p.description ? { description: p.description } : {}),
        url: `${SITE}/product/${p.slug}`,
        offers: { '@type': 'Offer', price: p.price, priceCurrency: 'INR' },
      })),
    })),
  };
}

async function main() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`[seo] ${TEMPLATE_PATH} not found — did the build run? Skipping.`);
    return;
  }
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  // Fetch the live menu first (resilient to Supabase errors) so the /menu page
  // can carry the full Menu schema and product pages can be generated.
  let products = [];
  try {
    products = await fetchProducts();
    console.log(`[seo] fetched ${products.length} menu items from Supabase`);
  } catch (e) {
    console.warn(`[seo] could not fetch menu (${e.message}) — emitting static routes only`);
  }
  const menuSchema = products.length ? buildMenuSchema(products) : null;

  // 1. Static routes → per-route HTML (the /menu page also carries Menu schema)
  for (const r of STATIC_ROUTES) {
    const schemas = crumbsFor(r.path);
    if (r.path === '/menu' && menuSchema) schemas.push(menuSchema);
    if (r.path === '/visit') schemas.push(faqSchema());
    const html = rewrite(template, {
      url: `${SITE}${r.path === '/' ? '/' : r.path}`,
      title: r.title,
      description: r.description,
      schemas,
    });
    writeRouteHtml(r.path, html);
  }

  // 2. Products → per-route HTML + sitemap entries
  for (const p of products) {
    const routePath = `/product/${p.slug}`;
    const title = `${p.name} — Conscious Cafe Auroville`;
    const description = p.description || `${p.name} — a consciously made dish at Conscious Cafe Auroville.`;
    const menuItem = {
      '@context': 'https://schema.org',
      '@type': 'MenuItem',
      '@id': `${SITE}${routePath}`,
      name: p.name,
      description,
      offers: {
        '@type': 'Offer',
        price: p.price,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `${SITE}${routePath}`,
      },
      isPartOf: { '@type': 'Menu', name: 'Conscious Cafe Menu', url: `${SITE}/menu` },
    };
    const breadcrumbs = crumb([
      { name: 'Home', path: '/' },
      { name: 'Menu', path: '/menu' },
      { name: p.name, path: routePath },
    ]);
    const html = rewrite(template, {
      url: `${SITE}${routePath}`,
      title,
      description,
      schemas: [menuItem, breadcrumbs],
    });
    writeRouteHtml(routePath, html);
  }

  // 3. SEO landing pages → per-route HTML
  for (const lp of LANDING_PAGES) {
    const routePath = `/${lp.slug}`;
    const schemas = [crumb([{ name: 'Home', path: '/' }, { name: lp.h1, path: routePath }])];
    if (lp.faqs && lp.faqs.length) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: lp.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      });
    }
    const html = rewrite(template, {
      url: `${SITE}${routePath}`,
      title: lp.title,
      description: lp.description,
      schemas,
    });
    writeRouteHtml(routePath, html);
  }

  // 4. Sitemap
  const productUrls = products.map(p => ({
    path: `/product/${p.slug}`, changefreq: 'weekly', priority: '0.7',
  }));
  const landingUrls = LANDING_PAGES.map(lp => ({
    path: `/${lp.slug}`, changefreq: 'monthly', priority: '0.8',
  }));
  const sitemap = buildSitemap([...STATIC_ROUTES, ...landingUrls, ...productUrls]);
  fs.writeFileSync(path.join(BUILD, 'sitemap.xml'), sitemap);

  console.log(`[seo] wrote ${STATIC_ROUTES.length} static routes, ${LANDING_PAGES.length} landing pages, ${products.length} product pages, sitemap (${STATIC_ROUTES.length + landingUrls.length + productUrls.length} urls)`);
}

main().catch(e => {
  // Never fail the deploy over SEO post-processing.
  console.error('[seo] generator error (non-fatal):', e);
  process.exit(0);
});
