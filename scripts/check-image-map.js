/* eslint-disable no-console */
/**
 * Menu-photo integrity check.  Run with `npm run check:images`.
 *
 * The website's dish photos do NOT come from the POS. POS uploads are capped at
 * 600px / WebP q0.60 (see Manager's `utils/imageUtils.js`), which is fine for a
 * POS tile but far too small for the 1800x2400 detail panel and the 2000x1120
 * full-bleed hero. So the curated shoots in `public/images/menu-photos/` are the
 * real source, wired up by `src/data/imageMap.js`, and `recipes.image_url` is
 * only a last-resort fallback.
 *
 * That indirection has three joins that can rot silently — nothing throws, a
 * photo just quietly disappears from the live site:
 *
 *   1. IMAGE_MAP key  -> recipes.sku          (dish retired, or SKU changed)
 *   2. IMAGE_MAP value -> file on disk        (typo, or case mismatch: .JPG/.jpg)
 *   3. landingPages.json highlights -> recipes.name  (dish renamed in the POS)
 *
 * This script turns each of those into a loud failure. It exits 1 on a real
 * break so it can gate a release; missing photos and unreferenced files are
 * reported as warnings only, since those are photography backlog, not bugs.
 *
 * It also checks two things that are not joins but rot the same way:
 *   - product URLs are toSlug(recipes.name), so two dishes slugging identically
 *     make one product page unreachable (error);
 *   - a mapped JPEG narrower than the 1800px detail panel gets upscaled and
 *     soft on the live site (warning — replace the export when convenient).
 *
 * Deliberately NOT wired into prebuild — it needs the network, and a Supabase
 * blip must never break a Netlify deploy.
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const LANDING_PAGES = require('../src/data/landingPages.json');

const SUPABASE_URL =
  process.env.REACT_APP_SUPABASE_URL || 'https://hxpbrlqclyujirspuuav.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cGJybHFjbHl1amlyc3B1dWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNDEzMTMsImV4cCI6MjA3NDYxNzMxM30.-0RMrh1IJLTztyfe-O0lYclVekcCYQA30cu53ZNTbZg';

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MAP_PATH = path.join(__dirname, '..', 'src', 'data', 'imageMap.js');
const PHOTO_DIRS = ['images/menu-photos/food', 'images/menu-photos/drinks'];

// Mirrors menuService.js normSku — the app joins IMAGE_MAP on normalised SKUs,
// so this check must join the same way or it would report false breaks.
const normSku = (sku) => (sku || '').trim().toUpperCase().replace(/\s+/g, ' ');

// Mirrors src/utils/slug.js — kept in sync by hand; used for the
// landingPages.json name join and the product-URL collision check, which is
// how the site itself resolves them.
const toSlug = (str = '') =>
  (str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Load IMAGE_MAP without a bundler. The file is ESM and this script is CJS, so
 * `require` would choke on `export`. Evaluating the real source (rather than
 * regexing the entries) means template literals resolve exactly as they do in
 * the app, so what we check is what ships.
 */
function loadImageMap() {
  const src = fs.readFileSync(MAP_PATH, 'utf8').replace(/\bexport\s+const\b/, 'const');
  // eslint-disable-next-line no-new-func
  return new Function(`${src}\nreturn IMAGE_MAP;`)();
}

function listPhotoFiles() {
  const files = new Set();
  for (const dir of PHOTO_DIRS) {
    const abs = path.join(PUBLIC_DIR, dir);
    if (!fs.existsSync(abs)) continue;
    for (const name of fs.readdirSync(abs)) {
      if (fs.statSync(path.join(abs, name)).isFile() && !name.startsWith('.')) {
        files.add(`${dir}/${name}`);
      }
    }
  }
  return files;
}

/**
 * Width/height of a JPEG without any image library — walks the marker chain to
 * the first SOF segment. Returns null for non-JPEG files (we only warn on what
 * we can read; a PNG or WebP photo simply skips the size check).
 */
function jpegSize(absPath) {
  const buf = fs.readFileSync(absPath);
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i += 1; continue; }
    const marker = buf[i + 1];
    if (marker === 0xff) { i += 1; continue; }
    // Standalone markers with no length payload
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) { i += 2; continue; }
    const len = buf.readUInt16BE(i + 2);
    // SOF0-SOF15 minus DHT/JPG/DAC hold the frame dimensions
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

// The detail panel requests 1800x2400; Gumlet will not upscale past the source,
// so anything narrower than this renders soft there.
const MIN_DETAIL_WIDTH = 1800;

async function fetchRecipes() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase
    .from('recipes')
    .select('name, sku, category, sub_category, image_url')
    .eq('is_production_recipe', true)
    .order('category')
    .order('name');
  if (error) throw error;
  return data || [];
}

async function main() {
  const IMAGE_MAP = loadImageMap();
  const files = listPhotoFiles();
  const recipes = await fetchRecipes();

  const errors = [];
  const warnings = [];

  // The app (menuService.js) joins on normalised SKUs, so we do too — but any
  // raw value that needed normalising is data drift worth flagging before it
  // confuses a human doing a by-eye comparison.
  const bySku = new Map(recipes.filter(r => r.sku).map(r => [normSku(r.sku), r]));
  for (const r of recipes) {
    if (r.sku && r.sku !== normSku(r.sku)) {
      warnings.push(
        `POS SKU for "${r.name}" is ${JSON.stringify(r.sku)} — stray whitespace/case. ` +
        `The site tolerates it, but the POS row should be cleaned up.`
      );
    }
  }
  for (const key of Object.keys(IMAGE_MAP)) {
    if (key !== normSku(key)) {
      warnings.push(`IMAGE_MAP key ${JSON.stringify(key)} is not in canonical form — write it as "${normSku(key)}".`);
    }
  }

  // ── 1. Every map key must still name a live dish ──────────────────────────
  for (const [rawKey, rel] of Object.entries(IMAGE_MAP)) {
    const key = normSku(rawKey);
    if (bySku.has(key)) continue;
    errors.push(
      rel
        ? `IMAGE_MAP key "${key}" matches no live dish — retired, or its SKU changed. ` +
          `Photo "${rel}" is now dead weight.`
        : `IMAGE_MAP has an empty slot for "${key}", which matches no live dish — ` +
          `the dish was retired, so drop the line.`
    );
  }

  // ── 2. Every mapped photo must exist on disk, case included ───────────────
  for (const [rawKey, rel] of Object.entries(IMAGE_MAP)) {
    if (rel === null) continue; // deliberate empty slot — reported in the backlog below
    const key = normSku(rawKey);
    if (files.has(rel)) {
      // On disk and mapped — also probe its size, since Gumlet cannot invent
      // pixels: a source narrower than the detail panel renders soft.
      const dims = jpegSize(path.join(PUBLIC_DIR, rel));
      if (dims && dims.width < MIN_DETAIL_WIDTH) {
        warnings.push(
          `UNDERSIZED — ${bySku.get(key)?.name || key} (${key}): "${rel}" is ` +
          `${dims.width}x${dims.height}, below the ${MIN_DETAIL_WIDTH}px detail panel. ` +
          `It will be upscaled and soft; replace with a larger export (new filename!).`
        );
      }
      continue;
    }
    const nameFor = bySku.get(key)?.name || key;
    // Distinguish a case-only mismatch: those work on macOS and 404 on Netlify,
    // which makes them the nastiest failure in this whole file.
    const caseHit = [...files].find(f => f.toLowerCase() === rel.toLowerCase());
    errors.push(
      caseHit
        ? `${nameFor} (${key}): case mismatch — map says "${rel}", disk has "${caseHit}". This 404s on Netlify.`
        : `${nameFor} (${key}): photo "${rel}" is missing from public/.`
    );
  }

  // ── 3. Product URLs are toSlug(name) — two dishes with the same slug means
  //       one product page is silently unreachable (getBySlug returns first hit)
  const bySlug = new Map();
  for (const r of recipes) {
    const slug = toSlug(r.name);
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(r);
  }
  for (const [slug, rs] of bySlug) {
    if (rs.length > 1) {
      errors.push(
        `URL collision: ${rs.map(r => `"${r.name}" (${r.sku})`).join(' and ')} both ` +
        `resolve to /product/${slug} — only the first is reachable. Rename one in the POS.`
      );
    }
  }

  // ── 4. Landing-page highlights resolve by NAME, so renames break them ─────
  const liveSlugs = new Set(bySlug.keys());
  for (const page of LANDING_PAGES) {
    for (const name of page.highlights || []) {
      if (!liveSlugs.has(toSlug(name))) {
        errors.push(
          `landingPages.json "${page.slug}": highlight "${name}" matches no live dish — ` +
          `it is silently dropped from the page.`
        );
      }
    }
  }

  // ── 5. Every live dish must appear in the map, even if only as an empty slot ─
  // This is the shoot checklist. A dish with no line at all means someone added
  // it to the POS and nobody decided about its photo — that is an error, so a new
  // dish can't quietly ship with a 600px POS thumbnail. Acknowledge it by adding
  // `'SKU': null` under NO PHOTO YET, which downgrades it to a warning.
  const mapByNorm = new Map(Object.entries(IMAGE_MAP).map(([k, v]) => [normSku(k), v]));
  const untriaged = recipes.filter(r => !mapByNorm.has(normSku(r.sku)));
  for (const r of untriaged) {
    errors.push(
      `${r.name} (${r.sku}, ${r.category}) is not in imageMap.js at all. ` +
      `Add a real photo path, or "'${r.sku}': null," under NO PHOTO YET to log it as a known gap.`
    );
  }

  // ── Warnings: the photography backlog — acknowledged, still unshot ─────────
  const gaps = recipes.filter(r => mapByNorm.get(normSku(r.sku)) === null);
  for (const r of gaps) {
    warnings.push(
      `NEEDS PHOTO — ${r.name} (${r.sku}, ${r.category}${r.sub_category && r.sub_category !== r.category ? ' · ' + r.sub_category : ''})` +
      `${r.image_url ? '' : ' — and the POS has no image either, so it renders blank'}`
    );
  }

  const referenced = new Set(Object.values(IMAGE_MAP).filter(Boolean));
  for (const f of files) {
    if (!referenced.has(f)) warnings.push(`Unreferenced photo on disk: ${f}`);
  }

  // ── Report ────────────────────────────────────────────────────────────────
  const shot = Object.values(IMAGE_MAP).filter(Boolean).length;
  console.log(
    `${recipes.length} live dishes: ${shot} photographed, ${gaps.length} awaiting a shoot` +
    `${untriaged.length ? `, ${untriaged.length} NOT IN THE MAP` : ''}. ` +
    `${files.size} files on disk.\n`
  );

  if (warnings.length) {
    console.log(`${warnings.length} warning(s):`);
    warnings.forEach(w => console.log(`  - ${w}`));
    console.log('');
  }

  if (errors.length) {
    console.error(`${errors.length} BROKEN link(s):`);
    errors.forEach(e => console.error(`  x ${e}`));
    console.error('\nFix these before deploying — each one is a photo missing from the live site.');
    process.exit(1);
  }

  console.log('All photo links intact.');
}

main().catch(err => {
  console.error('check-image-map failed:', err.message);
  process.exit(1);
});
