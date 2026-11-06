/**
 * Ice bath & Ayurvedic sauna booking — data access.
 *
 * Reads are the POS database's public functions (anon, no PII):
 *   wellness_menu()                 → { settings, services }
 *   wellness_slots(p_from, p_days)  → [{ service, slot_start, slot_end, places_left }]
 * (Manager Conscious Cafe, migration 20261106100000_wellness_slots.sql).
 *
 * Money moves through the Mise OS site's Netlify functions, which hold the
 * PhonePe keys: wellness-book (hold a place, start a payment) and
 * wellness-status (what became of it). Pages never call fetch or supabase
 * themselves — everything is here.
 */
import { supabase } from './supabase/supabaseClient';
import { FUNCTIONS_URL, LIMITS } from '../constants/wellness';
import { isNotDeployed } from '../utils/wellness';

const NOT_OPEN = { settings: null, services: [] };

// The site may go live before the migration: PGRST202 means "not open yet",
// not "broken" (isNotDeployed) — the caller sees an empty menu / no slots.
const unwrap = ({ data, error }, whenMissing) => {
  if (error) {
    if (isNotDeployed(error)) return whenMissing;
    throw error;
  }
  return data;
};

/** What can be booked and at what price. `services` is [] when nothing is open yet. */
export async function getMenu() {
  const data = unwrap(await supabase.rpc('wellness_menu'), NOT_OPEN) || NOT_OPEN;
  return { settings: data.settings || null, services: Array.isArray(data.services) ? data.services : [] };
}

/** Every bookable slot from an IST date ('YYYY-MM-DD') for `days` days, per service. */
export async function getSlots(from, days = LIMITS.slotsPerFetchDays) {
  return unwrap(await supabase.rpc('wellness_slots', { p_from: from, p_days: days }), []) || [];
}

/**
 * A refusal or failure from a payment function. `word` is the function's
 * `error` (invalid / not_found / full / too_many / payment_unavailable /
 * server) or null when nothing readable came back; `status` the HTTP status.
 */
export class BookingError extends Error {
  constructor(word, status, message) {
    super(message || word || `HTTP ${status}`);
    this.name = 'BookingError';
    this.word = word || null;
    this.status = status || 0;
  }
}

async function call(path, init) {
  const res = await fetch(`${FUNCTIONS_URL}/${path}`, { ...init, headers: { Accept: 'application/json', ...(init && init.headers) } });
  let body = null;
  try { body = await res.json(); } catch (_) { body = null; }
  if (!res.ok) throw new BookingError(body && typeof body.error === 'string' ? body.error : null, res.status);
  if (!body || typeof body !== 'object') throw new BookingError(null, res.status, 'empty response');
  return body;
}

/**
 * Hold places and start a PhonePe payment.
 * `slotStart` must be the exact string wellness_slots returned.
 * → { redirectUrl, merchantOrderId, amountPaise, basePaise, gstPaise, holdExpiresAt }
 * Throws BookingError (see bookErrorMessage in utils/wellness.js).
 */
export async function book({ service, slotStart, seats, name, phone, email }) {
  return call('wellness-book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service, slot_start: slotStart, seats, name, phone, email }),
  });
}

/**
 * What became of a payment.
 * → { state, service, serviceName, slotStart, slotEnd, seats, amountPaise, basePaise, gstPaise, name }
 * Throws BookingError with word 'not_found' for an unknown order.
 */
export async function getStatus(merchantOrderId) {
  return call(`wellness-status?order=${encodeURIComponent(merchantOrderId)}`, { method: 'GET' });
}
