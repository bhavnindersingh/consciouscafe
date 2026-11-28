import { variationCartItem } from './cartItem';
import { toSlug } from './slug';

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
 * 10–15 digits once spaces, dashes and the + are gone — what the café can
 * call back on, and what website_order_save() / sanctuary_rsvp() accept.
 */
export const phoneDigitsOk = (phone) => {
  const n = String(phone || '').replace(/\D/g, '').length;
  return n >= 10 && n <= 15;
};

/**
 * website_order_save()'s arguments, from what checkout shows — the same
 * calcTotals() numbers the WhatsApp message carries.
 */
export function buildOrderPayload(ref, cartItems, info, totals) {
  const distance = parseFloat(info.distance);
  // the record keeps one decimal; a tiny distance must not round to 0.0
  const km = Number.isFinite(distance) && distance > 0 ? Math.max(0.1, Math.round(distance * 10) / 10) : null;
  return {
    p_ref: ref,
    p_name: (info.name || '').trim().slice(0, 80),
    p_phone: (info.phone || '').trim(),
    p_email: (info.email || '').trim(),
    p_address: (info.address || '').trim(),
    p_distance_km: km,
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

/**
 * An organiser's way to /sanctuary/host, worded by where they stand (their
 * sanctuary_hosts row): their events once approved, their request while it's
 * waiting, their account if paused or declined. null for someone who doesn't
 * organise — each entry point words its own invitation for them.
 */
export function organiserLabel(hostRow) {
  if (!hostRow) return null;
  if (hostRow.status === 'approved') return 'Your events';
  if (hostRow.status === 'requested') return 'Your organiser request';
  return 'Your organiser account';
}

/**
 * The header's account menu for whoever is signed in: { name, email, initial,
 * items: [{ label, to }] }. Everyone gets their bookings and orders; an
 * organiser also gets the way to their events, worded by where they stand
 * (`hostRow` is their sanctuary_hosts row, or null). Sign out is the menu's own.
 */
export function accountMenu(user, hostRow) {
  const google = String(user?.user_metadata?.full_name || user?.user_metadata?.name || '').trim();
  const name = String(hostRow?.display_name || '').trim() || google;
  const email = user?.email || '';
  const items = [{ label: 'Your bookings and orders', to: '/account' }];
  if (hostRow) items.push({ label: organiserLabel(hostRow), to: '/sanctuary/host' });
  if (hostRow?.status === 'approved') items.push({ label: 'Your profile', to: `/sanctuary/hosts/${hostRow.user_id}` });
  const initial = (name || email).trim().charAt(0).toUpperCase() || '?';
  return { name, email, initial, items };
}

/** Prefill for a booking form: the account's name (if Google gave one) and email. */
export function accountPrefill(user) {
  // fields hold 80 characters (maxLength doesn't trim a value set in code)
  const full = String(user?.user_metadata?.full_name || user?.user_metadata?.name || '').trim().slice(0, 80);
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
 * on it go back in the bag at today's price; the rest are named. A variation
 * ("Cappuccino · Oat Milk") was saved as `<dish id>::<variation id or slug>`
 * (utils/cartItem) — it comes back as that same variation, if the dish still
 * offers it.
 */
export function reorderPlan(items = [], products = []) {
  const byId = new Map(products.map((p) => [String(p.id), p]));
  const add = [];
  const gone = [];
  for (const it of items) {
    const qty = Math.max(1, Number(it.qty) || 1);
    const [baseId, form] = String(it.id).split('::');
    const p = byId.get(baseId);
    if (p && form === undefined) { add.push({ ...p, quantity: qty }); continue; }
    const v = p && (p.variations || []).find((x) => String(x.id) === form || toSlug((x.name || '').trim()) === form);
    if (v) add.push(variationCartItem(p, v, qty));
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
