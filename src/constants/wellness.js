/**
 * Ice bath & Ayurvedic sauna — booking vocabularies.
 *
 * JS twin of the CHECK constraints and the public shapes in the POS repo:
 *   Manager Conscious Cafe/backend/supabase/migrations/20261106100000_wellness_slots.sql
 * (service keys, resource keys, booking statuses) and of the payment functions
 * beside it (wellness-book's refusal words, wellness-status's `state`). Mise OS
 * keeps its own copy in frontend/src/constants/wellness.js. Change all three
 * together — a key the database doesn't know is a failed booking, and one this
 * file doesn't know renders as a blank label.
 */

// wellness_services.key — what a guest books. `uses` says which rooms it takes
// a place in; a contrast session takes a place in both.
export const SERVICE_KEYS = ['ice_bath', 'sauna', 'contrast'];

// wellness_resources.key — the two rooms.
export const RESOURCE_KEYS = ['ice_bath', 'sauna'];

// wellness_bookings.status (the database's words; the guest never sees these).
export const BOOKING_STATUSES = ['held', 'confirmed', 'cancelled', 'expired'];

// wellness-status's `state` — what the return page is told.
export const BOOKING_STATES = ['confirmed', 'pending', 'failed', 'refund', 'cancelled'];

// Where PhonePe sends the guest back (the function builds this URL from the
// site origin; the route here has to match it).
export const BOOKING_PATH = '/sanctuary/restore';
export const RETURN_PATH = '/sanctuary/restore/booked';

// Payment functions live on the Mise OS site.
export const FUNCTIONS_URL =
  process.env.REACT_APP_MISE_FUNCTIONS_URL || 'https://manager.consciouscafe.in/.netlify/functions';

// The café's number — the footer's. Cancellations are staff-only, by phone or WhatsApp.
export const CAFE_PHONE = '+91 87545 61269';
export const CAFE_PHONE_TEL = 'tel:+918754561269';
export const CAFE_WHATSAPP_URL = 'https://wa.me/918754561269';

// Return page: poll wellness-status this often, for this long, while `pending`.
export const STATUS_POLL_MS = 3000;
export const STATUS_POLL_LIMIT_MS = 90000;

export const LIMITS = {
  nameMax: 80,
  emailMax: 200,
  slotsPerFetchDays: 7, // wellness_slots is read a week at a time (it caps at 31)
};

// The exact `error` words wellness-book returns, and what the guest reads.
// Anything else is a network or server failure.
export const BOOK_ERROR_COPY = {
  invalid: 'Please check your name, phone number, email and number of places.',
  not_found: 'That time is no longer open for booking — pick another.',
  full: 'Not enough places left at that time — try fewer places, or another time.',
  too_many: 'This phone number already has a few bookings waiting for payment. Finish one of those first, or call us.',
  payment_unavailable: 'Online payment isn’t available right now. Call or WhatsApp us and we’ll book you in.',
  server: 'Something went wrong on our side. Please try again in a moment.',
};
export const BOOK_ERROR_FALLBACK = 'We couldn’t reach the booking desk. Check your connection and try again.';

// After `full` or `not_found` the slots are stale — the page re-reads them.
export const REFETCH_AFTER = ['full', 'not_found'];
