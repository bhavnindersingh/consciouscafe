/**
 * Ice bath & Ayurvedic sauna booking — pure rules: paise maths, labels,
 * slots by day, the seat cap, validation, and the words a guest reads for each
 * refusal and each payment state.
 *
 * Money is worked out in paise exactly as wellness_hold() does
 * (20261106100000_wellness_slots.sql):
 *   base = round(price_inr × 100) × seats
 *   gst  = round(base × gst_rate / 100)
 *   total = base + gst
 * so the bill the guest sees is the amount PhonePe charges, to the paisa.
 *
 * Times come from wellness_slots() as timestamptz strings and are shown in
 * Asia/Kolkata through utils/sanctuary's IST helpers. Never new Date('YYYY-MM-DD').
 */
import { isoToIstParts, formatClock, formatDay, dateBlock, normalisePhone, istToday, addDays } from './sanctuary';
import {
  SERVICE_KEYS, BOOKING_STATES, LIMITS, BOOK_ERROR_COPY, BOOK_ERROR_FALLBACK, REFETCH_AFTER,
  CAFE_PHONE, STATUS_POLL_LIMIT_MS,
} from '../constants/wellness';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^\S+@\S+\.\S+$/; // the same test wellness-book applies
const ORDER_ID_RE = /^CSW[A-F0-9]{32}$/; // wellness_hold's merchant_order_id shape
const DAY_MS = 24 * 60 * 60 * 1000;

// ── Money ───────────────────────────────────────────────────────────────────

/** Rupees (a number or numeric string) → whole paise. */
export const toPaise = (inr) => Math.round(Number(inr) * 100);

/**
 * The bill for `seats` places at `priceInr` each with GST at `gstRate` %,
 * in paise — the server's arithmetic, so the two never disagree.
 * The rate is taken to 2 decimals (numeric(5,2)) and the maths stays in integers.
 */
export function quote(priceInr, seats, gstRate) {
  const n = Number(seats);
  const base = Number.isInteger(n) && n > 0 ? toPaise(priceInr) * n : 0;
  const rateBp = Math.round(Number(gstRate || 0) * 100);
  const gst = Math.round((base * rateBp) / 10000);
  return { basePaise: base, gstPaise: gst, totalPaise: base + gst };
}

/** '₹1,416' — or '₹1,416.50' when the paise aren't a whole rupee. */
export function rupees(paise) {
  const p = Math.round(Number(paise) || 0);
  const whole = p % 100 === 0;
  return `₹${(p / 100).toLocaleString('en-IN', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/** '₹1,200 per person + GST' — a service's price line on the choice card. */
export const priceLine = (priceInr) => `${rupees(toPaise(priceInr))} per person + GST`;

/** 'GST (18%)' — the bill's label, from the settings rate, no stray decimals. */
export function gstLabel(gstRate) {
  const r = Number(gstRate || 0);
  return `GST (${Number.isInteger(r) ? r : r.toFixed(2).replace(/0+$/, '')}%)`;
}

// ── Services ────────────────────────────────────────────────────────────────

export const isServiceKey = (k) => SERVICE_KEYS.includes(k);

/** The menu's services in the vocabulary's order, unknown keys dropped. */
export function orderServices(services) {
  return (services || [])
    .filter((s) => isServiceKey(s.key))
    .sort((a, b) => SERVICE_KEYS.indexOf(a.key) - SERVICE_KEYS.indexOf(b.key));
}

/** 'Ice bath' / 'Sauna' / 'Sauna + ice bath' — what the slot takes a place in. */
export function usesLabel(uses) {
  const names = { ice_bath: 'ice bath', sauna: 'sauna' };
  const list = (uses || []).map((u) => names[u]).filter(Boolean);
  if (!list.length) return '';
  const s = list.join(' + ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Days and slots ──────────────────────────────────────────────────────────

/**
 * The days a guest may pick: today in Auroville and the next `bookAheadDays`
 * — the same window wellness_slots() serves (its last day is today + book_ahead_days).
 */
export function dayStrip(bookAheadDays, now = Date.now()) {
  const n = Math.max(0, Math.min(90, Number(bookAheadDays) || 0));
  const today = istToday(now);
  return Array.from({ length: n + 1 }, (_, i) => addDays(today, i));
}

/** Days between two 'YYYY-MM-DD' dates (b − a). */
export const daysBetween = (a, b) =>
  DATE_RE.test(a || '') && DATE_RE.test(b || '')
    ? Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / DAY_MS)
    : 0;

/**
 * Slots are fetched a week at a time from today. The chunk a date belongs to
 * starts on today + 7k — pass that as p_from with p_days = 7.
 */
export function weekChunkStart(date, today = istToday()) {
  const diff = Math.max(0, daysBetween(today, date));
  return addDays(today, Math.floor(diff / LIMITS.slotsPerFetchDays) * LIMITS.slotsPerFetchDays);
}

/** The IST calendar date a slot falls on. */
export const slotDate = (slot) => isoToIstParts(slot.slot_start).date;

/** { 'YYYY-MM-DD': slots[] } by IST start, each day's slots in time order. */
export function groupSlotsByDay(rows) {
  const out = {};
  for (const r of rows || []) {
    const k = slotDate(r);
    if (!k) continue;
    (out[k] = out[k] || []).push(r);
  }
  for (const k of Object.keys(out)) out[k].sort((a, b) => new Date(a.slot_start) - new Date(b.slot_start));
  return out;
}

/** One service's slots on one IST day, in time order. */
export function slotsFor(rows, service, date) {
  return groupSlotsByDay((rows || []).filter((r) => r.service === service))[date] || [];
}

/** Does this service have anything bookable (a place left) on this day? */
export const dayHasPlaces = (rows, service, date) => slotsFor(rows, service, date).some((s) => s.places_left > 0);

/** 1..min(maxSeats, placesLeft); 0 when the slot is full. */
export function seatCap(maxSeats, placesLeft) {
  const m = Math.max(0, Math.floor(Number(maxSeats) || 0));
  const p = Math.max(0, Math.floor(Number(placesLeft) || 0));
  return Math.min(m, p);
}

/** 'Full' / '1 place left' / '3 places left'. */
export function placesLabel(placesLeft) {
  const n = Math.max(0, Math.floor(Number(placesLeft) || 0));
  if (n === 0) return 'Full';
  return n === 1 ? '1 place left' : `${n} places left`;
}

/** '7 – 8 am', '11 am – 12 pm' — a slot's span, IST. */
export function slotRange(startIso, endIso) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s.getTime())) return '';
  if (Number.isNaN(e.getTime())) return formatClock(startIso);
  const samePeriod = formatClock(startIso).slice(-2) === formatClock(endIso).slice(-2);
  return `${formatClock(startIso, !samePeriod)} – ${formatClock(endIso)}`;
}

/** 'Tue 10 Nov · 7 – 8 am' — one line for a booked slot. */
export const slotLine = (startIso, endIso) => `${formatDay(startIso)} · ${slotRange(startIso, endIso)}`;

/** The day-strip tile's three words for a 'YYYY-MM-DD' date (IST, noon so no edge rolls over). */
export const dayTile = (date) => dateBlock(`${date}T06:30:00Z`);

/** 'Today' / 'Tomorrow' / '' for the strip's small caption. */
export function dayCaption(date, now = Date.now()) {
  const diff = daysBetween(istToday(now), date);
  return diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : '';
}

/** Is the picked slot still in the fresh list, with enough places? */
export function stillBookable(slots, picked, seats) {
  if (!picked) return false;
  const fresh = (slots || []).find((s) => s.service === picked.service && s.slot_start === picked.slot_start);
  return !!fresh && fresh.places_left >= Math.max(1, Number(seats) || 1);
}

// ── The guest's details ─────────────────────────────────────────────────────

/**
 * Form → { errors, value }. Email is required here: it is the receipt.
 * The phone goes as normalisePhone() gives it (+91…), so a trunk-0 number and
 * the same number without it are one guest at the database.
 */
export function validateBooking(form, cap) {
  const errors = {};
  const name = String(form.name || '').trim();
  const email = String(form.email || '').trim().toLowerCase();
  const seats = Number(form.seats);
  const phone = normalisePhone(form.phone);
  if (!name) errors.name = 'Your name, please.';
  else if (name.length > LIMITS.nameMax) errors.name = 'A shorter name, please.';
  if (!phone) errors.phone = 'A phone number we can reach you on.';
  if (!email) errors.email = 'Your email — the receipt goes there.';
  else if (!EMAIL_RE.test(email) || email.length > LIMITS.emailMax) errors.email = 'That email doesn’t look right.';
  const max = Math.max(0, Number(cap) || 0);
  if (max < 1) errors.seats = 'That time is full — pick another.';
  else if (!Number.isInteger(seats) || seats < 1 || seats > max) errors.seats = max === 1 ? 'One place is left here.' : `Between 1 and ${max} places.`;
  return { errors, value: { name, phone, email, seats } };
}

// ── Before the migration is live ────────────────────────────────────────────

/**
 * The website may go live before the database migration is applied. Then
 * PostgREST answers the RPC with PGRST202 ("could not find the function … in
 * the schema cache"). That is "nothing is bookable yet", not a failure — the
 * page shows the calm "Booking opens soon" state. A network or server error
 * is still an error.
 */
export function isNotDeployed(err) {
  if (!err) return false;
  if (err.code === 'PGRST202') return true;
  return /schema cache|could not find the function/i.test(String(err.message || err.details || err.hint || ''));
}

// ── Refusals and payment states ─────────────────────────────────────────────

/** What a guest reads when wellness-book refuses (its `error` word) or can't be reached. */
export function bookErrorMessage(err) {
  const word = err && (err.word || err.error);
  return BOOK_ERROR_COPY[word] || (err && err.status >= 500 ? BOOK_ERROR_COPY.server : BOOK_ERROR_FALLBACK);
}

/** After these refusals the slots shown are stale. */
export const shouldRefetch = (err) => REFETCH_AFTER.includes(err && (err.word || err.error));

/** Route input → a merchant order id, or null. */
export function cleanOrderId(s) {
  const v = String(s || '').trim().toUpperCase();
  return ORDER_ID_RE.test(v) ? v : null;
}

export const isBookingState = (s) => BOOKING_STATES.includes(s);

/** Keep polling wellness-status? Only while pending and within the limit. */
export const keepPolling = (state, startedAt, now = Date.now()) =>
  state === 'pending' && now - startedAt < STATUS_POLL_LIMIT_MS;

/**
 * The return page's words for each state (and for the two things that aren't a
 * state: an unknown order and a wait that ran out).
 */
export function stateCopy(state, { name } = {}) {
  const first = String(name || '').trim().split(' ')[0];
  switch (state) {
    case 'confirmed':
      return {
        heading: first ? `You’re booked, ${first}.` : 'You’re booked.',
        body: 'Your receipt and the details are on their way to your email. See you at the Sanctuary.',
      };
    case 'pending':
      return { heading: 'Confirming your payment…', body: 'This usually takes a few seconds. Keep this page open.' };
    case 'waiting':
      return {
        heading: 'Still confirming.',
        body: `PhonePe hasn’t told us yet. We’ll email you as soon as it lands — or call us on ${CAFE_PHONE} and we’ll check.`,
      };
    case 'failed':
      return { heading: 'The payment didn’t go through.', body: 'Nothing was charged and no place was taken. You can try again.' };
    case 'refund':
      return {
        heading: 'That time was taken while you paid.',
        body: 'Your payment arrived after the place went to someone else, so a full refund is on its way — it reaches your account in a few days. Pick another time whenever you like.',
      };
    case 'cancelled':
      return { heading: 'This booking was cancelled.', body: `If that’s a surprise, call us on ${CAFE_PHONE}.` };
    default:
      return { heading: 'We can’t find that booking.', body: 'The link may be incomplete. Your confirmation email has the details.' };
  }
}
