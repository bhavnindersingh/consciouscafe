import React, { useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDeliveryMenu } from '../../hooks/useDeliveryMenu';
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  MAIN_CATEGORY_META,
  MAIN_CATEGORY_ORDER,
} from '../../utils/menuEnrichment';
import '../../styles/printMenu.css';

// ── Tiny helpers ─────────────────────────────────────────────────────────────

const DIETARY_LABELS = {
  vegetarian:        { label: 'Vegetarian',          emoji: '🟢'   },
  vegan:             { label: 'Vegan',               emoji: '🌱'   },
  contains_egg:      { label: 'Contains Egg',        emoji: '🥚'   },
  gluten_free:       { label: 'Gluten-Free',         emoji: '🌾🚫' },
  contains_dairy:    { label: 'Contains Dairy',      emoji: '🥛'   },
  contains_nuts_soy: { label: 'Contains Nuts / Soy', emoji: '🥜'   },
  spicy:             { label: 'Spicy',               emoji: '🌶️'   },
};

function esc(s) {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function phSrc(name) {
  const ch = (name || '·').charAt(0).toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400'><rect width='300' height='400' fill='%23e4dfd2'/><text x='150' y='230' font-family='Georgia,serif' font-size='100' fill='%236f7d63' text-anchor='middle'>${ch}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + svg;
}

// ── HTML block builders ───────────────────────────────────────────────────────

function dietLine(keys) {
  return (keys || []).map(key => {
    const def = DIETARY_LABELS[key] || { label: key, emoji: '' };
    return esc(`${def.emoji} ${def.label}`.trim());
  }).join(' · ');
}

// Same as dietLine, but drops any label whose word the name already carries —
// e.g. "Flat White Vegan - Coconut Milk" needs no separate "🌱 Vegan" tag.
// Keeps the legend where the variation name gives no dietary signal of its own.
function dietLineFor(keys, name) {
  const lname = (name || '').toLowerCase();
  return dietLine((keys || []).filter(key => {
    const def = DIETARY_LABELS[key] || { label: key, emoji: '' };
    return !lname.includes(def.label.toLowerCase());
  }));
}

function cardHTML(p) {
  const labels = dietLine(p.dietaryLabels);
  // Variations straight from POS — name, price and legend exactly as stored.
  const varRows = (p.variations || []).map(v => {
    const vdiet = dietLineFor(v.dietaryLabels, v.name);
    return `<div class="pm-card-var">
    <span class="pm-var-name">${esc(v.name)}</span>
    <span class="pm-var-lead"></span>
    ${vdiet ? `<span class="pm-var-diet">${vdiet}</span>` : ''}
    <span class="pm-var-price"><span class="pm-card-cur">₹</span>${v.price}</span>
  </div>`;
  }).join('');
  // Print uses the high-res 1800×2400 variant — ~847 DPI on the 54mm card.
  const src = esc(p.imageDetail || p.image || '');
  const ph = phSrc(p.name);
  return `<div class="pm-card">
  <div class="pm-card-pol">
    <img src="${src}" alt="${esc(p.name)}" loading="eager" onerror="this.onerror=null;this.src='${ph}'" />
  </div>
  <div class="pm-card-head">
    <span class="pm-card-name">${esc(p.name)}</span>
    <span class="pm-card-price"><span class="pm-card-cur">₹</span>${p.price}</span>
  </div>
  <div class="pm-card-rule"></div>
  ${p.description ? `<div class="pm-card-desc">${esc(p.description)}</div>` : ''}
  ${(varRows || labels) ? `<div class="pm-card-foot">
    ${varRows ? `<div class="pm-card-vars"><span class="pm-card-vars-lbl">Options</span>${varRows}</div>` : ''}
    ${labels ? `<div class="pm-card-diet">${labels}</div>` : ''}
  </div>` : ''}
</div>`;
}

function catHead(idx, name, note, isCont) {
  return `<div class="pm-chead">
  <span class="pm-ch-name">${esc(name)}</span>
  <span class="pm-ch-note">${isCont ? 'continued' : esc(note)}</span>
  <div class="pm-ch-rule"></div>
</div>`;
}

function folio(num) {
  return `<div class="pm-folio">
  <span>Page ${num}</span>
</div>`;
}

// Drinks cover — split-screen lemon illustration + centred branding panel.
function drinksCoverHTML(meta, cats, catCounts) {
  const catPills = cats
    .map(c => `<span class="pm-cv-pill">${esc(c.name)} · ${catCounts[c.id] || 0}</span>`)
    .join('');

  return `<section class="pm-page pm-cover pm-cover-drinks" data-main="drinks">
  <div class="pm-cv-split">
    <div class="pm-cv-art">
      <img src="/watermelon.webp" alt="" />
      <span class="pm-cv-art-cap">Watermelon · Anny Cecilia Walter</span>
    </div>
    <div class="pm-cv">
      <div class="pm-cv-header">
        <img class="pm-cv-flower" src="/hibiscus.png" alt="" />
        <span class="pm-cv-wordmark">Conscious Café</span>
        <span class="pm-cv-loc">Auroville Road · Pondicherry</span>
      </div>
      <div class="pm-cv-mid">
        <div class="pm-cv-eyebrow">The Drinks List</div>
        <div class="pm-cv-title">Drinks<em>.</em></div>
        <p class="pm-cv-sub">Pressed, brewed &amp; poured — plant-led and unhurried, from cold-pressed juices to small-batch coffee.</p>
      </div>
      <div class="pm-cv-foot">
        <div class="pm-cv-craft">
          <span class="pm-cv-craft-lbl">The Craft</span>
          <div class="pm-cv-craft-row">
            <span>Cold-Pressed</span><span class="pm-cv-craft-dot">✦</span><span>Petal-Steeped</span><span class="pm-cv-craft-dot">✦</span><span>Small-Batch</span>
          </div>
        </div>
        <div class="pm-cv-cat-pills">${catPills}</div>
        <div class="pm-cv-foot-row">
          <span class="pm-cv-foot-note">All prices in ₹ · taxes additional</span>
          <a class="pm-cv-foot-url" href="https://consciouscafe.in">consciouscafe.in</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

// Per-category cover — one self-contained title page per main category.
function coverHTML(main, meta, cats, catCounts, total) {
  if (main === 'drinks') return drinksCoverHTML(meta, cats, catCounts);

  const catPills = cats
    .map(c => `<span class="pm-cv-cat-pill">${esc(c.name)} <b>${catCounts[c.id] || 0}</b></span>`)
    .join('');

  return `<section class="pm-page pm-cover" data-main="${main}">
  <div class="pm-cv">
    <div class="pm-cv-header">
      <span class="pm-cv-wordmark">Conscious Café</span>
      <span class="pm-cv-loc">Auroville Road · Pondicherry</span>
    </div>
    <div class="pm-cv-mid">
      <div class="pm-cv-eyebrow">The ${esc(meta.name)} Menu</div>
      <div class="pm-cv-title">${esc(meta.name)}<em>.</em></div>
      <p class="pm-cv-sub">${esc(meta.note)}.</p>
    </div>
    <div class="pm-cv-foot">
      <div class="pm-cv-pills"><span class="pm-cv-pill">${esc(meta.name)} · <b>${total}</b></span></div>
      <div class="pm-cv-cat-pills">${catPills}</div>
      <div class="pm-cv-foot-row">
        <span class="pm-cv-foot-note">All prices in ₹ · taxes additional</span>
        <a class="pm-cv-foot-url" href="https://consciouscafe.in">consciouscafe.in</a>
      </div>
    </div>
  </div>
</section>`;
}

// Legend built straight from DIETARY_LABELS so the key on the back page always
// matches the markers printed on the cards — one source of truth.
function legendHTML() {
  return Object.values(DIETARY_LABELS).map(def =>
    `<span class="pm-bk-leg-item"><span class="pm-bk-leg-em">${def.emoji}</span>${esc(def.label)}</span>`
  ).join('');
}

// Per-category end page — repeated at the close of every booklet.
function backHTML(main) {
  return `<section class="pm-page pm-back" data-main="${main}">
  <div class="pm-pad">
    <div class="pm-bk-top">
      <div class="pm-bk-word">Conscious Café</div>
      <div class="pm-bk-loc">Auroville Road · Pondicherry · Tamil Nadu</div>
    </div>
    <p class="pm-bk-lead">Made with intention, <em>served with care</em> — thank you for sitting a while.</p>
    <div class="pm-bk-grid">
      <div class="pm-bk-block">
        <div class="pm-bk-lbl">Hours</div>
        <div class="pm-bk-row"><span>Mon, Wed — Fri</span><span class="pm-bd"></span><span>9:30 — 21:00</span></div>
        <div class="pm-bk-row"><span>Sat — Sun</span><span class="pm-bd"></span><span>9:30 — 22:00</span></div>
        <div class="pm-bk-row"><span>Tuesday</span><span class="pm-bd"></span><span>Closed</span></div>
      </div>
      <div class="pm-bk-block">
        <div class="pm-bk-lbl">Find us</div>
        <p>Kuilapalayam Main Road,<br/>Auroville Road, Tamil Nadu 605101</p>
      </div>
      <div class="pm-bk-block">
        <div class="pm-bk-lbl">Reach us</div>
        <a href="tel:+918754561269">+91 87545 61269</a>
        <a href="mailto:hello@consciouscafe.in">hello@consciouscafe.in</a>
        <a href="https://consciouscafe.in">consciouscafe.in</a>
      </div>
      <div class="pm-bk-block">
        <div class="pm-bk-lbl">Good to know</div>
        <p>Walk-ins always welcome. For large groups a quick message helps us hold the right space.</p>
        <p>Ask our team about the Conscious loyalty card — a little thank-you for returning.</p>
      </div>
    </div>
    <div class="pm-bk-allergen">
      <div class="pm-bk-lbl pm-bk-leg-lbl">Dietary Key</div>
      <div class="pm-bk-legend">${legendHTML()}</div>
      <p>All prices in ₹, exclusive of applicable taxes. Please inform your server about any allergies.</p>
      <p class="pm-bk-admission">The right of admission is reserved, at the discretion of the management.</p>
    </div>
  </div>
</section>`;
}

// ── Paginator ─────────────────────────────────────────────────────────────────
// Measures each card row's real pixel height and packs rows into A4 pages.
// Returns { html: string, catseq: Array }.

function buildDocument(items, measDiv, focusMain) {
  // Fixed layout: every content page shows two equal card bands (2 rows × 3
  // cards). CSS stretches the bands to fill the page height, so no dynamic
  // height measurement or packing is needed.

  // Build per-category lookup
  const byCategory = {};
  items.forEach(p => {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  });

  const mainCounts = {};
  const catCounts = {};
  items.forEach(p => {
    mainCounts[p.mainCategory] = (mainCounts[p.mainCategory] || 0) + 1;
    catCounts[p.category] = (catCounts[p.category] || 0) + 1;
  });

  // Build ordered sequence of categories that have products
  const catseq = [];
  let globalIdx = 1;
  const knownOrder = new Set(CATEGORY_ORDER);

  MAIN_CATEGORY_ORDER.forEach(main => {
    const ordered = CATEGORY_ORDER.filter(id => {
      const item = items.find(p => p.category === id);
      return item && item.mainCategory === main;
    });
    const extra = Object.keys(byCategory).filter(id => {
      const item = items.find(p => p.category === id);
      return item && item.mainCategory === main && !knownOrder.has(id);
    });

    [...ordered, ...extra].forEach(id => {
      if (!byCategory[id]?.length) return;
      const meta = CATEGORY_META[id] || {
        name: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        note: '',
      };
      catseq.push({ idx: String(globalIdx++).padStart(2, '0'), id, mainCat: main, name: meta.name, note: meta.note });
    });
  });

  // Pack one main category's rows into A4 content pages — two card-rows per
  // page, forming equal top/bottom bands. Booklets never share a page.
  const packCats = (cats) => {
    const rows = [];
    cats.forEach(c => {
      chunk(byCategory[c.id] || [], 3).forEach((cards, i) => {
        rows.push({ id: c.id, idx: c.idx, name: c.name, note: c.note, cards, firstOfCat: i === 0 });
      });
    });

    const pages = [];
    for (let i = 0; i < rows.length; i += 2) {
      const pageRows = rows.slice(i, i + 2);
      const blocks = [];
      pageRows.forEach((r, j) => {
        // A category header leads the first band of every page (marked
        // "continued" when a category spills over) and any band where the
        // category changes mid-page.
        const needHdr = j === 0 || pageRows[j - 1].id !== r.id;
        if (needHdr) blocks.push(catHead(r.idx, r.name, r.note, !r.firstOfCat));
        blocks.push(`<div class="pm-grid">${r.cards.map(cardHTML).join('')}</div>`);
      });
      // Stretch bands to fill the page only when the page is full (2 rows); a
      // lone trailing row sits at its natural height instead of ballooning.
      pages.push({ blocks, fill: pageRows.length === 2 });
    }

    return pages;
  };

  // Build a self-contained booklet per main category: cover → content → end.
  // When focusMain is given, only that category's booklet is built — each
  // category is its own standalone menu document.
  const mainsToBuild = (focusMain && MAIN_CATEGORY_ORDER.includes(focusMain))
    ? [focusMain]
    : MAIN_CATEGORY_ORDER;

  let html = '';
  mainsToBuild.forEach(main => {
    const cats = catseq.filter(c => c.mainCat === main);
    if (!cats.length) return;
    const meta = MAIN_CATEGORY_META[main];
    const pages = packCats(cats);

    html += coverHTML(main, meta, cats, catCounts, mainCounts[main] || 0);
    html += pages
      .map((p, i) =>
        `<section class="pm-page" data-main="${main}">
  <div class="pm-pad"><div class="pm-flow${p.fill ? ' pm-flow-fill' : ''}">${p.blocks.join('')}</div></div>
  ${folio(i + 2)}
</section>`
      )
      .join('');
    html += backHTML(main);
  });

  measDiv.innerHTML = '';

  return { html, catseq };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PrintMenuPage() {
  const { items, loading, error } = useDeliveryMenu();
  const [searchParams] = useSearchParams();
  const rawFocus = searchParams.get('focus'); // 'food' | 'drinks' | 'patisserie'
  const focus = MAIN_CATEGORY_ORDER.includes(rawFocus) ? rawFocus : null;
  const docRef = useRef(null);
  const measRef = useRef(null);
  const [built, setBuilt] = useState(false);
  const [catseq, setCatseq] = useState([]);

  // Build A4 pages after data + fonts load. When `focus` is set, only that
  // category's standalone booklet is built — rebuilds whenever focus changes.
  useEffect(() => {
    if (loading || !items.length || !docRef.current || !measRef.current) return;
    let cancelled = false;
    setBuilt(false);

    document.fonts.ready.then(() => {
      if (cancelled) return;
      const result = buildDocument(items, measRef.current, focus);
      if (docRef.current) {
        docRef.current.innerHTML = result.html;
        setCatseq(result.catseq);
        setBuilt(true);
      }
    });

    return () => { cancelled = true; };
  }, [items, loading, focus]);

  // Auto-open the print dialog once a focused (single-category) menu is built
  useEffect(() => {
    if (!built || !focus) return;
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, [built, focus]);

  // Main categories that actually have items — one standalone menu per booklet
  const printbarMains = MAIN_CATEGORY_ORDER
    .map(main => ({ main, meta: MAIN_CATEGORY_META[main] }))
    .filter(g => catseq.some(c => c.mainCat === g.main));

  return (
    <div className="pm-root">
      {/* Off-screen measuring host — must be in DOM before useEffect runs */}
      <div ref={measRef} className="pm-meas" aria-hidden="true" />

      {loading && <div className="pm-loading">Building menu…</div>}
      {error && <div className="pm-error">Unable to load menu data.</div>}

      {/* Paginator injects A4 pages here */}
      <div ref={docRef} id="pm-doc" />

      {/* Print controls — hidden during print via @media print */}
      {built && focus && (
        <div className="pm-printbar">
          <button className="pm-btn-main" onClick={() => window.print()}>
            ↓ Print {MAIN_CATEGORY_META[focus].name} Menu
          </button>
          <a href="/print-menu" className="pm-back-link">← All menus</a>
          <a href="/" className="pm-back-link">← Back to site</a>
        </div>
      )}

      {built && !focus && (
        <div className="pm-printbar">
          {printbarMains.map(g => (
            <a key={g.main} href={`/print-menu?focus=${g.main}`} className="pm-btn-main">
              ↓ {g.meta.name} Menu
            </a>
          ))}

          <a href="/" className="pm-back-link">← Back to site</a>
        </div>
      )}
    </div>
  );
}
