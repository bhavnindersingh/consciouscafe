/*
 * Your account (/account) — the pure parts: the order reference checkout
 * makes, what it saves, and how my_account()'s lists become the page.
 * The database side is POS migration 20261129000000_customer_accounts.sql;
 * the ref's shape is checked there too (^W-[0-9A-HJKMNP-TV-Z]{6}$) — change both.
 */

/** Crockford base32 — no I, L, O or U, so a ref read aloud on the phone can't be misheard. */
export const ORDER_REF_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const ORDER_REF_PATTERN = /^W-[0-9A-HJKMNP-TV-Z]{6}$/;

// A ref only has to be unique (the table refuses a repeat), not secret: use the
// browser's crypto where it exists, Math.random where it doesn't (old test DOMs).
const randomBytes = (n) => {
  const b = new Uint8Array(n);
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (c && typeof c.getRandomValues === 'function') c.getRandomValues(b);
  else for (let i = 0; i < n; i += 1) b[i] = Math.floor(Math.random() * 256);
  return b;
};

/** 'W-7K3Q9P' — 32 letters, so each byte's low five bits pick one evenly. */
export function makeOrderRef(bytes = randomBytes(6)) {
  let out = 'W-';
  for (let i = 0; i < 6; i += 1) out += ORDER_REF_ALPHABET[bytes[i] & 31];
  return out;
}

// rounded as the WhatsApp message prints them (toFixed), so the saved figures match the chat
const round2 = (n) => Number(Number(n || 0).toFixed(2));

/**
 * website_order_save()'s arguments, from what checkout shows — the same
 * calcTotals() numbers the WhatsApp message carries.
 */
export function buildOrderPayload(ref, cartItems, info, totals) {
  const distance = parseFloat(info.distance);
  return {
    p_ref: ref,
    p_name: (info.name || '').trim(),
    p_phone: (info.phone || '').trim(),
    p_email: (info.email || '').trim(),
    p_address: (info.address || '').trim(),
    p_distance_km: Number.isFinite(distance) ? distance : null,
    p_notes: (info.notes || '').trim() || null,
    p_items: cartItems.map((it) => ({
      id: String(it.id),
      name: it.name,
      qty: Number(it.quantity) || 1,
      price: round2(it.price),
    })),
    p_subtotal: round2(totals.subtotal),
    p_packaging: round2(totals.packaging),
    p_gst: round2(totals.gst),
    p_total: round2(totals.total),
    p_packaging_known: !!totals.packagingKnown,
  };
}

/** 'Priya' from Google's full name; null when there is none (we never guess from a booking). */
export function firstName(user) {
  const full = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  const first = String(full).trim().split(/\s+/)[0];
  return first || null;
}

/** Prefill for a booking form: the account's name (if Google gave one) and email. */
export function accountPrefill(user) {
  const full = String(user?.user_metadata?.full_name || user?.user_metadata?.name || '').trim();
  return { name: full, email: user?.email || '' };
}

/**
 * my_account()'s events and sessions as one timeline: what's still to come
 * (soonest first — anything not yet over counts) and what's past (latest first).
 */
export function timeline(account, now = Date.now()) {
  const events = (account?.events || []).map((e) => ({
    type: 'event', key: `e-${e.id}`, start: e.starts_at, end: e.ends_at, item: e,
  }));
  const sessions = (account?.sessions || []).map((s) => ({
    type: 'session', key: `s-${s.id}`, start: s.slot_start, end: s.slot_end, item: s,
  }));
  const all = [...events, ...sessions];
  const ends = (x) => new Date(x.end || x.start).getTime();
  const starts = (x) => new Date(x.start).getTime();
  const upcoming = all.filter((x) => ends(x) > now).sort((a, b) => starts(a) - starts(b));
  const past = all.filter((x) => ends(x) <= now).sort((a, b) => starts(b) - starts(a));
  return { upcoming, past };
}

/** A place's state, when it isn't simply booked. */
export function eventState(e) {
  if (e.event_cancelled) return 'Event cancelled';
  if (e.status === 'cancelled') return 'Cancelled';
  return null;
}

/** A session's state, when it isn't simply booked. */
export function sessionState(s) {
  if (s.status !== 'cancelled') return null;
  if (s.refund_state === 'completed') return 'Cancelled · refunded';
  if (s.refund_state === 'pending') return 'Cancelled · refund on its way';
  return 'Cancelled';
}

export const placesLabel = (n) => `${n} ${Number(n) === 1 ? 'place' : 'places'}`;

/** '2 × Millet bowl, Ragi cookie and 2 more' */
export function itemsSummary(items = [], max = 3) {
  const shown = items.slice(0, max).map((it) => (Number(it.qty) > 1 ? `${it.qty} × ${it.name}` : it.name));
  const rest = items.length - shown.length;
  return rest > 0 ? `${shown.join(', ')} and ${rest} more` : shown.join(', ');
}

/**
 * "Order again": each saved line matched to today's menu by id. Dishes still
 * on it go back in the bag at today's price; the rest are named.
 */
export function reorderPlan(items = [], products = []) {
  const byId = new Map(products.map((p) => [String(p.id), p]));
  const add = [];
  const gone = [];
  for (const it of items) {
    const p = byId.get(String(it.id));
    if (p) add.push({ ...p, quantity: Math.max(1, Number(it.qty) || 1) });
    else gone.push(it.name);
  }
  return { add, gone };
}

/** '₹590', '₹1,478.40' — paise only when there are some. */
export function rupees(n) {
  const v = Number(n || 0);
  const paise = Math.round(v * 100) % 100 !== 0;
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: paise ? 2 : 0, maximumFractionDigits: 2 })}`;
}

/** 'A', 'A and B', 'A, B and C' */
export function listAnd(names = []) {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
