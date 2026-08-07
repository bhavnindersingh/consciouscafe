/* eslint-disable no-console */
/**
 * Website <-> POS sync check.  Run with `npm run check:menu`.
 *
 * The menu, its prices, its sections and what is even orderable all live in the
 * POS (`Manager Conscious Cafe`, Supabase project hxpbrlqclyujirspuuav). This
 * repo only decorates that data. Every decoration is a join that can rot without
 * throwing — a dish silently vanishes, a section loses its house voice, a bill
 * quietly stops matching the till. This script reads the live POS and reports
 * each one.
 *
 * Checked here:
 *   1. Delivery gate      — dishes the POS will not send out, hidden from the
 *                           site. Not a bug, but the single most common cause of
 *                           "why isn't X on the website?", so it is listed.
 *   2. Landing highlights — landingPages.json names a dish that is hidden or
 *                           renamed; the page silently drops it.
 *   3. Section curation   — live sub-categories with no CATEGORY_META entry, and
 *                           entries matching nothing live.
 *   4. Packaging rates    — a live category with no rate in app_settings packs
 *                           free on the site, exactly as it does in the POS.
 *   5. Dietary labels     — a POS label this site cannot render.
 *
 * Exit 1 only for things that are actually broken (a landing page pointing at a
 * dish that no longer exists, a dietary label with no rendering, a section with
 * no name). Curation gaps and hidden dishes are warnings — they are decisions,
 * not defects.
 *
 * Like check:images, deliberately NOT wired into prebuild: it needs the network,
 * and a Supabase blip must never break a Netlify deploy.
 */
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const LANDING_PAGES = require('../src/data/landingPages.json');

const SUPABASE_URL =
  process.env.REACT_APP_SUPABASE_URL || 'https://hxpbrlqclyujirspuuav.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cGJybHFjbHl1amlyc3B1dWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNDEzMTMsImV4cCI6MjA3NDYxNzMxM30.-0RMrh1IJLTztyfe-O0lYclVekcCYQA30cu53ZNTbZg';

// Mirrors src/utils/slug.js.
const toSlug = (str = '') =>
  (str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

// Read the curation maps out of the ESM source without a bundler: they are
// plain object literals, so evaluate just the export bodies.
function readEsmExports(file, names) {
  const src = require('fs').readFileSync(path.join(__dirname, '..', file), 'utf8');
  const out = {};
  for (const name of names) {
    const start = src.indexOf(`export const ${name} =`);
    if (start === -1) throw new Error(`${name} not found in ${file}`);
    const from = src.indexOf('=', start) + 1;
    const openCh = src[src.slice(from).search(/[[{]/) + from];
    const closeCh = openCh === '[' ? ']' : '}';
    let depth = 0;
    let end = from;
    for (let i = from; i < src.length; i += 1) {
      if (src[i] === openCh) depth += 1;
      else if (src[i] === closeCh) {
        depth -= 1;
        if (depth === 0) { end = i + 1; break; }
      }
    }
    // eslint-disable-next-line no-eval
    out[name] = eval(`(${src.slice(from, end)})`);
  }
  return out;
}

// The brace matcher above is deliberate but naive — a brace inside a `note:`
// string would throw it off. Failing soft keeps the other five checks running:
// a parse problem here must not take down the whole report.
let CATEGORY_META = null;
let MAIN_CATEGORY_META = {};
let metaReadError = null;
try {
  ({ CATEGORY_META, MAIN_CATEGORY_META } = readEsmExports(
    'src/utils/menuEnrichment.js',
    ['CATEGORY_META', 'MAIN_CATEGORY_META']
  ));
} catch (err) {
  metaReadError = err.message;
}

// Mirrors menuService.js — the site renders these seven and nothing else.
const RENDERABLE_DIETARY = [
  'vegetarian', 'vegan', 'contains_egg', 'gluten_free',
  'contains_dairy', 'contains_nuts_soy', 'spicy',
];

// Mirrors ADDON_CATEGORIES in src/services/menuService.js.
const ADDON_CATEGORIES = ['Extras'];

const errors = [];
const warnings = [];
const notes = [];

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const [{ data: recipes, error: recipeErr }, { data: settings }] = await Promise.all([
    supabase
      .from('recipes')
      .select('name, category, sub_category, available_for_delivery, dietary_labels, selling_price')
      .eq('is_production_recipe', true)
      .order('name'),
    supabase.from('app_settings').select('value').eq('key', 'packaging_charges').single(),
  ]);
  if (recipeErr) throw recipeErr;

  const live = recipes || [];
  const packagingRates = settings?.value || {};

  const isAddon = (r) => ADDON_CATEGORIES.includes((r.category || '').trim());
  const sellable = live.filter((r) => r.available_for_delivery && !isAddon(r));
  const hidden = live.filter((r) => !r.available_for_delivery && !isAddon(r));

  console.log(
    `${live.length} live dishes: ${sellable.length} orderable on the website, ` +
    `${hidden.length} held back by the POS delivery switch, ` +
    `${live.filter(isAddon).length} add-ons excluded by category.\n`
  );

  // 1. What the delivery gate hides, by main category.
  const hiddenByCat = {};
  hidden.forEach((r) => {
    (hiddenByCat[r.category] = hiddenByCat[r.category] || []).push(r.name);
  });
  Object.entries(hiddenByCat).forEach(([cat, names]) => {
    warnings.push(
      `HIDDEN — ${names.length} ${cat} dish(es) are not "Available for Delivery" in the POS, ` +
      `so the website will not sell them: ${names.slice(0, 6).join(', ')}` +
      `${names.length > 6 ? `, +${names.length - 6} more` : ''}`
    );
  });
  // A whole main category with nothing sellable is a page that renders empty.
  Object.keys(MAIN_CATEGORY_META).forEach((main) => {
    const liveInMain = live.filter((r) => toSlug(r.category) === main);
    if (liveInMain.length && !liveInMain.some((r) => r.available_for_delivery)) {
      warnings.push(
        `EMPTY SECTION — /menu/${main} has ${liveInMain.length} live dish(es) but none are ` +
        `available for delivery, so the page shows only its "nothing going out today" note.`
      );
    }
  });

  // 2. Landing-page highlights.
  const byName = new Map(live.map((r) => [r.name, r]));
  LANDING_PAGES.forEach((page) => {
    (page.highlights || []).forEach((name) => {
      const dish = byName.get(name);
      if (!dish) {
        errors.push(
          `LANDING BREAK — "${page.slug}" highlights "${name}", which is not a live POS dish ` +
          `(renamed or retired). It is silently dropped from the page.`
        );
      } else if (!dish.available_for_delivery || isAddon(dish)) {
        warnings.push(
          `LANDING HIDDEN — "${page.slug}" highlights "${name}", which the delivery switch hides. ` +
          `The page renders without it.`
        );
      }
    });
    const highlights = page.highlights || [];
    const shown = highlights.filter((n) => {
      const d = byName.get(n);
      return d && d.available_for_delivery && !isAddon(d);
    });
    if (highlights.length && shown.length === 0) {
      // Empty because every dish is switched off is a decision, not a defect —
      // the same rule the HIDDEN warnings follow. Empty because the names no
      // longer resolve is a break: nobody chose that.
      const anyLive = highlights.some((n) => byName.has(n));
      const message =
        `LANDING EMPTY — "${page.slug}" has ${highlights.length} highlight(s) and none of them ` +
        `are orderable, so its dish grid renders empty.` +
        (anyLive ? ' Turn on "Available for Delivery" in the POS to restore it.' : '');
      (anyLive ? warnings : errors).push(message);
    }
  });

  // 3. Section curation, both directions.
  if (!CATEGORY_META) {
    errors.push(
      `SECTION CHECK SKIPPED — could not read CATEGORY_META from src/utils/menuEnrichment.js ` +
      `(${metaReadError}). Section drift is unchecked until this parses.`
    );
  }
  const liveSections = new Map();
  live.forEach((r) => {
    if (isAddon(r)) return;
    const slug = toSlug(r.sub_category || r.category);
    liveSections.set(slug, (liveSections.get(slug) || 0) + 1);
  });
  [...liveSections.entries()].sort().forEach(([slug, count]) => {
    if (CATEGORY_META && !CATEGORY_META[slug]) {
      errors.push(
        `SECTION UNNAMED — POS sub-category "${slug}" (${count} dish(es)) has no CATEGORY_META entry ` +
        `in src/utils/menuEnrichment.js, so it renders auto-titled, with no note, sorted last.`
      );
    }
  });
  Object.keys(CATEGORY_META || {}).forEach((slug) => {
    if (!liveSections.has(slug)) {
      warnings.push(
        `SECTION DEAD — CATEGORY_META has "${slug}", which matches no live POS sub-category. ` +
        `Renamed in the POS, or retired.`
      );
    }
  });

  // 4. Packaging rates — mirrors utils/totals.js, which keys on raw category.
  const liveCategories = [...new Set(live.filter((r) => !isAddon(r)).map((r) => r.category))];
  liveCategories.forEach((cat) => {
    if (packagingRates[cat] == null) {
      warnings.push(
        `PACKAGING FREE — no rate for category "${cat}" in app_settings.packaging_charges, ` +
        `so its dishes add ₹0 packaging at checkout (same as the POS). Set it in POS Settings if wrong.`
      );
    }
  });
  Object.keys(packagingRates).forEach((key) => {
    if (!liveCategories.includes(key) && !ADDON_CATEGORIES.includes(key)) {
      notes.push(
        `packaging rate "${key}" (₹${packagingRates[key]}) matches no live top-level category — ` +
        `the POS keys packaging on recipes.category only, so this rate is never charged.`
      );
    }
  });

  // 5. Dietary labels the site cannot render.
  const unknownLabels = new Map();
  live.forEach((r) => {
    (r.dietary_labels || []).forEach((l) => {
      if (!RENDERABLE_DIETARY.includes(l)) unknownLabels.set(l, (unknownLabels.get(l) || 0) + 1);
    });
  });
  unknownLabels.forEach((count, label) => {
    errors.push(
      `DIETARY UNKNOWN — POS label "${label}" is on ${count} dish(es) but the website has no ` +
      `rendering for it; it shows as raw text.`
    );
  });

  // Report
  const print = (title, list) => {
    if (!list.length) return;
    console.log(`${title} (${list.length}):`);
    list.forEach((m) => console.log(`  - ${m}`));
    console.log('');
  };
  print('Errors', errors);
  print('Warnings', warnings);
  print('Notes', notes);

  if (!errors.length && !warnings.length) console.log('Website and POS are in sync.');
  process.exit(errors.length ? 1 : 0);
}

main().catch((err) => {
  console.error('check:menu failed to reach the POS —', err.message);
  process.exit(1);
});
