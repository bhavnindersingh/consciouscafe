import React, { useRef, useEffect, useState, useCallback } from 'react';
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

function cardHTML(p) {
  const labels = (p.dietaryLabels || []).map(key => {
    const def = DIETARY_LABELS[key] || { label: key, emoji: '' };
    return esc(`${def.emoji} ${def.label}`.trim());
  }).join(' · ');
  const src = esc(p.image || '');
  const ph = phSrc(p.name);
  return `<div class="pm-card">
  <div class="pm-card-pol">
    <img src="${src}" alt="${esc(p.name)}" loading="eager" onerror="this.onerror=null;this.src='${ph}'" />
  </div>
  <div class="pm-card-head">
    <span class="pm-card-name">${esc(p.name)}</span>
    <span class="pm-card-lead"></span>
    <span class="pm-card-price"><span class="pm-card-cur">₹</span>${p.price}</span>
  </div>
  ${labels ? `<div class="pm-card-diet">${labels}</div>` : ''}
  ${p.description ? `<div class="pm-card-desc">${esc(p.description)}</div>` : ''}
</div>`;
}

function catHead(idx, name, note, isCont) {
  return `<div class="pm-chead">
  <span class="pm-ch-num">${idx}</span>
  <span class="pm-ch-name">${esc(name)}</span>
  <span class="pm-ch-note">${isCont ? 'continued' : esc(note)}</span>
  <div class="pm-ch-rule"></div>
</div>`;
}

function rhead() {
  return `<div class="pm-rhead">
  <div class="pm-rh-left"><span class="pm-rh-brand">Conscious Café</span></div>
  <span class="pm-rh-tag">The Menu · Auroville Road</span>
</div>`;
}

function folio(num) {
  return `<div class="pm-folio">
  <span>The Menu · Auroville Road</span>
  <span class="pm-folio-dot"></span>
  <span>Page ${num}</span>
</div>`;
}

function coverHTML(mainCounts, catseq, catCounts) {
  const mainPills = MAIN_CATEGORY_ORDER
    .filter(m => mainCounts[m])
    .map(m => {
      const meta = MAIN_CATEGORY_META[m];
      return `<span class="pm-cv-pill">${esc(meta.name)} · <b>${mainCounts[m]}</b></span>`;
    })
    .join('');

  const catPills = catseq
    .map(c => `<span class="pm-cv-cat-pill">${esc(c.name)} <b>${catCounts[c.id] || 0}</b></span>`)
    .join('');

  return `<section class="pm-page pm-cover">
  <div class="pm-cv">
    <div class="pm-cv-header">
      <span class="pm-cv-wordmark">Conscious Café</span>
      <span class="pm-cv-loc">Auroville Road · Pondicherry</span>
    </div>
    <div class="pm-cv-mid">
      <div class="pm-cv-eyebrow">The Complete Menu</div>
      <div class="pm-cv-title">The<br/>Menu<em>.</em></div>
      <p class="pm-cv-sub">Plant-forward, made in-house — from cold-pressed juices to slow-braised bowls.</p>
    </div>
    <div class="pm-cv-foot">
      <div class="pm-cv-pills">${mainPills}</div>
      <div class="pm-cv-cat-pills">${catPills}</div>
      <div class="pm-cv-foot-row">
        <span class="pm-cv-foot-note">All prices in ₹ · taxes additional</span>
        <span class="pm-cv-foot-url">consciouscafe.in</span>
      </div>
    </div>
  </div>
</section>`;
}

function backHTML() {
  return `<section class="pm-page pm-back">
  <div class="pm-pad">
    <div class="pm-bk-top">
      <div class="pm-bk-word">Conscious Café</div>
      <div class="pm-bk-loc">Auroville Road · Pondicherry · Tamil Nadu</div>
    </div>
    <p class="pm-bk-lead">Made with intention, <em>served with care</em> — thank you for sitting a while.</p>
    <div class="pm-bk-grid">
      <div class="pm-bk-block">
        <div class="pm-bk-lbl">Hours</div>
        <div class="pm-bk-row"><span>Mon, Wed — Sun</span><span class="pm-bd"></span><span>9:30 — 21:00</span></div>
        <div class="pm-bk-row"><span>Tuesday</span><span class="pm-bd"></span><span>Closed</span></div>
      </div>
      <div class="pm-bk-block">
        <div class="pm-bk-lbl">Find us</div>
        <p>Kuilapalayam Main Road,<br/>Auroville Road, Tamil Nadu 605101</p>
      </div>
      <div class="pm-bk-block">
        <div class="pm-bk-lbl">Reach us</div>
        <span>+91 87545 61269</span>
        <span>hello@consciouscafe.in</span>
        <span>consciouscafe.in</span>
      </div>
      <div class="pm-bk-block">
        <div class="pm-bk-lbl">Good to know</div>
        <p>Walk-ins always welcome. For large groups a quick message helps us hold the right space.</p>
      </div>
    </div>
    <div class="pm-bk-allergen">
      <div class="pm-bk-legend">
        <span>vegan — fully plant-based</span>
        <span>gf — gluten-free</span>
        <span>veg — contains dairy or egg</span>
      </div>
      <p>All prices in ₹, exclusive of applicable taxes. Please inform your server about any allergies.</p>
    </div>
  </div>
</section>`;
}

// ── Paginator ─────────────────────────────────────────────────────────────────
// Measures each card row's real pixel height and packs rows into A4 pages.
// Returns { html: string, catseq: Array }.

function buildDocument(items, measDiv) {
  // px-per-mm calibration
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;left:-9999px;top:0;width:100mm;visibility:hidden';
  document.body.appendChild(probe);
  const MM = probe.offsetWidth / 100;
  probe.remove();
  const mm = v => v * MM;

  // Height measure: insert one element, read offsetHeight
  const H = (html) => {
    measDiv.innerHTML = html;
    return (measDiv.firstElementChild?.offsetHeight) || 0;
  };

  const GAP = mm(7);
  const rheadH = H(rhead());
  // A4 = 297mm, padding top+bottom = 13mm each = 26mm, folio safety = 7mm
  const availH = mm(297 - 26) - rheadH - mm(6) - mm(7);

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

  // Flatten into rows of up to 3 cards each
  const rows = [];
  catseq.forEach(c => {
    chunk(byCategory[c.id] || [], 3).forEach((cards, i) => {
      rows.push({ id: c.id, idx: c.idx, name: c.name, note: c.note, mainCat: c.mainCat, cards, firstOfCat: i === 0 });
    });
  });

  // Pack rows into pages
  const pages = [];
  let cur = null;
  let curCat = null;

  const startPage = () => {
    cur = { blocks: [], used: 0, cats: [], mains: [] };
    pages.push(cur);
    curCat = null;
  };

  const add = (html, h) => {
    cur.used += (cur.blocks.length ? GAP : 0) + h;
    cur.blocks.push(html);
  };

  rows.forEach(r => {
    const gridHtml = `<div class="pm-grid">${r.cards.map(cardHTML).join('')}</div>`;
    const rH = H(gridHtml);
    const headHtml = catHead(r.idx, r.name, r.note, !r.firstOfCat);
    let placed = false;

    if (cur) {
      const needHdr = curCat !== r.id;
      const hH = needHdr ? H(headHtml) : 0;
      const extra = needHdr
        ? (cur.blocks.length ? GAP : 0) + hH + GAP + rH
        : (cur.blocks.length ? GAP : 0) + rH;

      if (cur.used + extra <= availH) {
        if (needHdr) add(headHtml, hH);
        add(gridHtml, rH);
        if (!cur.cats.includes(r.id)) cur.cats.push(r.id);
        if (!cur.mains.includes(r.mainCat)) cur.mains.push(r.mainCat);
        curCat = r.id;
        placed = true;
      }
    }

    if (!placed) {
      startPage();
      const hh = H(headHtml);
      add(headHtml, hh);
      add(gridHtml, rH);
      cur.cats.push(r.id);
      cur.mains.push(r.mainCat);
      curCat = r.id;
    }
  });

  measDiv.innerHTML = '';

  // Render pages to HTML
  const contentHTML = pages
    .map((p, i) =>
      `<section class="pm-page" data-cats="${p.cats.join(' ')}" data-main="${p.mains.join(' ')}">
  <div class="pm-pad">${rhead()}<div class="pm-flow">${p.blocks.join('')}</div></div>
  ${folio(i + 2)}
</section>`
    )
    .join('');

  return {
    html: coverHTML(mainCounts, catseq, catCounts) + contentHTML + backHTML(),
    catseq,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PrintMenuPage() {
  const { items, loading, error } = useDeliveryMenu();
  const [searchParams] = useSearchParams();
  const focus = searchParams.get('focus'); // 'food' | 'drinks' | 'patisserie'
  const docRef = useRef(null);
  const measRef = useRef(null);
  const [built, setBuilt] = useState(false);
  const [catseq, setCatseq] = useState([]);

  // Define print helpers first so the auto-print effect can reference them
  const printMain = useCallback((mainId) => {
    const pgs = document.querySelectorAll('.pm-page[data-main]');
    const visible = [];
    pgs.forEach(pg => {
      if ((pg.dataset.main || '').split(' ').includes(mainId)) {
        pg.classList.add('cat-visible');
        visible.push(pg);
      }
    });
    document.body.classList.add('printing-cat');
    window.print();
    document.body.classList.remove('printing-cat');
    visible.forEach(pg => pg.classList.remove('cat-visible'));
  }, []);

  const printCat = useCallback((catId) => {
    const pgs = document.querySelectorAll('.pm-page[data-cats]');
    const visible = [];
    pgs.forEach(pg => {
      if ((pg.dataset.cats || '').split(' ').includes(catId)) {
        pg.classList.add('cat-visible');
        visible.push(pg);
      }
    });
    document.body.classList.add('printing-cat');
    window.print();
    document.body.classList.remove('printing-cat');
    visible.forEach(pg => pg.classList.remove('cat-visible'));
  }, []);

  // Build A4 pages after data + fonts load
  useEffect(() => {
    if (loading || !items.length || !docRef.current || !measRef.current) return;
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled) return;
      const result = buildDocument(items, measRef.current);
      if (docRef.current) {
        docRef.current.innerHTML = result.html;
        setCatseq(result.catseq);
        setBuilt(true);
      }
    });

    return () => { cancelled = true; };
  }, [items, loading]);

  // Auto-trigger print for a specific main category when opened via footer link
  useEffect(() => {
    if (!built || !focus) return;
    if (!MAIN_CATEGORY_ORDER.includes(focus)) return;
    const timer = setTimeout(() => printMain(focus), 300);
    return () => clearTimeout(timer);
  }, [built, focus, printMain]);

  // Group catseq by main category for the printbar
  const printbarGroups = MAIN_CATEGORY_ORDER
    .map(main => ({
      main,
      meta: MAIN_CATEGORY_META[main],
      cats: catseq.filter(c => c.mainCat === main),
    }))
    .filter(g => g.cats.length > 0);

  return (
    <div className="pm-root">
      {/* Off-screen measuring host — must be in DOM before useEffect runs */}
      <div ref={measRef} className="pm-meas" aria-hidden="true" />

      {loading && <div className="pm-loading">Building menu…</div>}
      {error && <div className="pm-error">Unable to load menu data.</div>}

      {/* Paginator injects A4 pages here */}
      <div ref={docRef} id="pm-doc" />

      {/* Print controls — hidden during print via @media print */}
      {built && (
        <div className="pm-printbar">
          <button className="pm-btn-primary" onClick={() => window.print()}>
            ↓ Print All
          </button>

          {printbarGroups.map(g => (
            <div key={g.main} className="pm-printbar-group">
              <button className="pm-btn-main" onClick={() => printMain(g.main)}>
                {g.meta.name}
              </button>
              {g.cats.map(c => (
                <button key={c.id} className="pm-btn-cat" onClick={() => printCat(c.id)}>
                  {c.name}
                </button>
              ))}
            </div>
          ))}

          <a href="/" className="pm-back-link">← Back to site</a>
        </div>
      )}
    </div>
  );
}
