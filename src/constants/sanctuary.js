/**
 * Conscious Sanctuary vocabularies.
 *
 * JS twin of the CHECK constraints in the POS repo:
 *   Manager Conscious Cafe/backend/supabase/migrations/20261104200000_sanctuary.sql
 * Change both together — a value the database doesn't know is a failed save,
 * and one this file doesn't know renders as a blank label.
 */

export const OFFERING_KINDS = [
  { value: 'event', label: 'Event', plural: 'Events' },
  { value: 'class', label: 'Class', plural: 'Classes' },
  { value: 'workshop', label: 'Workshop', plural: 'Workshops' },
];

export const HOST_STATUSES = ['requested', 'approved', 'declined', 'paused'];
export const OFFERING_STATUSES = ['draft', 'published', 'cancelled'];
export const RSVP_STATUSES = ['confirmed', 'cancelled'];

// Limits mirrored from the same migration (CHECKs and sanctuary_rsvp()).
export const LIMITS = {
  titleMin: 3,
  titleMax: 120,
  descriptionMax: 5000,
  locationMax: 200,
  capacityMax: 1000,
  maxDays: 14,
  seatsPerRsvp: 6,
  nameMax: 80,
  emailMax: 200,
  hostNameMin: 2,
  hostNameMax: 80,
  bioMax: 2000,
  linkMax: 300,
  hostPhoneMax: 20,
  codeResendSeconds: 60, // Supabase's default gap between two sign-in emails to one address
  seriesMaxDates: 26,    // a weekly series: at most this many dates in one go
  seriesMaxWeeks: 26,    // …and no further out than this
};

// Weekdays as JavaScript numbers them (0 = Sunday), listed Monday first.
export const WEEKDAYS = [
  { value: 1, short: 'Mon', name: 'Monday' },
  { value: 2, short: 'Tue', name: 'Tuesday' },
  { value: 3, short: 'Wed', name: 'Wednesday' },
  { value: 4, short: 'Thu', name: 'Thursday' },
  { value: 5, short: 'Fri', name: 'Friday' },
  { value: 6, short: 'Sat', name: 'Saturday' },
  { value: 0, short: 'Sun', name: 'Sunday' },
];

export const DEFAULT_LOCATION = 'Conscious Sanctuary, Auroville Road';
export const IMAGE_BUCKET = 'sanctuary-images';
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

// The exact messages sanctuary_rsvp() raises (SQLSTATE P0001), and what a
// visitor reads for each. Anything else is a network or server failure.
export const RSVP_ERROR_COPY = {
  invalid: 'Please check your name, phone number and number of places.',
  not_found: 'This gathering is no longer on the calendar.',
  closed: 'Reservations for this one have closed.',
  too_many: 'This number already holds several reservations today. Message us if you need more.',
  already_booked: 'This phone number already has a place reserved for this one.',
  full: 'Not enough places left — try fewer, or message us to join the waitlist.',
};

// What a host reads when email sign-in refuses — keyed by authErrorKind().
export const HOST_AUTH_COPY = {
  not_open: 'Host sign-in opens very soon. Until then, message us on WhatsApp and we’ll set you up.',
  slow_down: 'We sent you a code a moment ago — use that one, or wait a minute and ask for a new one.',
  bad_code: 'That code didn’t work — it may have expired. Use the newest email, or send a new code.',
  bad_email: 'That email doesn’t look right.',
  other: 'We couldn’t sign you in just now. Please try again.',
};
