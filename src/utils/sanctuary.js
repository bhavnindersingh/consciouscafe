/**
 * Conscious Sanctuary — pure rules: IST date/time maths, labels, validation.
 *
 * Every time is stored as a timestamptz and shown in Asia/Kolkata. A host types
 * a date and a clock time "as on the wall in Auroville"; istToIso() turns that
 * into an instant with an explicit +05:30, so a browser in another timezone
 * can't shift it. Never `new Date('YYYY-MM-DD')` — that is midnight UTC.
 */
import { OFFERING_KINDS, LIMITS, DEFAULT_LOCATION, RSVP_ERROR_COPY } from '../constants/sanctuary';

const TZ = 'Asia/Kolkata';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY_MS = 24 * 60 * 60 * 1000;

const partsFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
const labelFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
});
const clockFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true,
});
const monthFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, month: 'long', year: 'numeric' });

const parts = (fmt, d) => Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
const valid = (d) => d instanceof Date && !Number.isNaN(d.getTime());

/** '2026-11-11', '07:00' (IST wall clock) → ISO instant, or null if either is malformed or impossible. */
export function istToIso(date, time) {
  if (!DATE_RE.test(date || '') || !TIME_RE.test(time || '')) return null;
  const d = new Date(`${date}T${time}:00+05:30`);
  if (!valid(d)) return null;
  // Date quietly rolls 2026-02-30 into March; refuse instead.
  const back = isoToIstParts(d.toISOString());
  return back.date === date && back.time === time ? d.toISOString() : null;
}

/** ISO instant → { date: 'YYYY-MM-DD', time: 'HH:MM' } on the IST wall clock. */
export function isoToIstParts(iso) {
  const d = new Date(iso);
  if (!valid(d)) return { date: '', time: '' };
  const p = parts(partsFmt, d);
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/** 'Tue 11 Nov' (IST). */
export function formatDay(iso) {
  const p = parts(labelFmt, new Date(iso));
  return `${p.weekday} ${p.day} ${p.month}`;
}

/** '7 am', '8:15 pm' (IST) — minutes only when they aren't :00. */
export function formatClock(iso, withPeriod = true) {
  const p = parts(clockFmt, new Date(iso));
  const t = p.minute === '00' ? p.hour : `${p.hour}:${p.minute}`;
  return withPeriod ? `${t} ${p.dayPeriod.toLowerCase()}` : t;
}

/**
 * One line for a gathering's time.
 *   same day:  'Tue 11 Nov · 7 – 8:15 am'   or  'Tue 11 Nov · 11 am – 1 pm'
 *   multi-day: 'Sat 15 Nov, 10 am – Sun 16 Nov, 4 pm'
 */
export function formatWhen(startsIso, endsIso) {
  const s = new Date(startsIso);
  const e = new Date(endsIso);
  if (!valid(s)) return '';
  if (!valid(e)) return `${formatDay(startsIso)} · ${formatClock(startsIso)}`;
  if (isoToIstParts(startsIso).date === isoToIstParts(endsIso).date) {
    const samePeriod = parts(clockFmt, s).dayPeriod === parts(clockFmt, e).dayPeriod;
    const start = samePeriod ? formatClock(startsIso, false) : formatClock(startsIso);
    return `${formatDay(startsIso)} · ${start} – ${formatClock(endsIso)}`;
  }
  return `${formatDay(startsIso)}, ${formatClock(startsIso)} – ${formatDay(endsIso)}, ${formatClock(endsIso)}`;
}

/** Calendar-tile pieces: { weekday: 'Tue', day: '11', month: 'Nov' }. */
export function dateBlock(iso) {
  const p = parts(labelFmt, new Date(iso));
  return { weekday: p.weekday, day: p.day, month: p.month };
}

/** 'November 2026' — the listing's month headings. */
export const monthLabel = (iso) => monthFmt.format(new Date(iso));

export function groupByMonth(items) {
  const groups = [];
  for (const item of items) {
    const key = monthLabel(item.starts_at);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, items: [item] });
  }
  return groups;
}

export function kindLabel(kind, plural = false) {
  const k = OFFERING_KINDS.find((x) => x.value === kind);
  if (!k) return '';
  return plural ? k.plural : k.label;
}

export const filterByKind = (items, kind) =>
  kind === 'all' ? items : items.filter((o) => o.kind === kind);

/** 'Free' for null/0, else '₹2,500'. Display only — nothing is paid online. */
export function priceLabel(price) {
  const n = Number(price);
  if (price === null || price === undefined || price === '' || !Number.isFinite(n) || n === 0) return 'Free';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export const isFree = (price) => priceLabel(price) === 'Free';

/** seats_left is NULL when capacity is NULL (unlimited) — never treat that as 0. */
export function seatsLabel(seatsLeft, capacity) {
  if (capacity === null || capacity === undefined) return 'Open to all';
  if (seatsLeft <= 0) return 'Full';
  if (seatsLeft === 1) return 'Last place';
  if (seatsLeft <= 3) return `Last ${seatsLeft} places`;
  return `${seatsLeft} places left`;
}

export const isFull = (o) => o.capacity !== null && o.capacity !== undefined && (o.seats_left ?? 0) <= 0;
export const hasStarted = (o, now = Date.now()) => new Date(o.starts_at).getTime() <= now;
export const isPast = (o, now = Date.now()) => new Date(o.ends_at).getTime() <= now;

/** Can a visitor reserve right now? Mirrors sanctuary_rsvp()'s 'closed' / 'full'. */
export function rsvpState(o, now = Date.now()) {
  if (!o) return 'missing';
  if (o.status === 'cancelled') return 'cancelled';
  if (hasStarted(o, now)) return isPast(o, now) ? 'past' : 'started';
  if (isFull(o)) return 'full';
  return 'open';
}

/**
 * '+919876543210' or null. Digits only; an Indian trunk 0 (09876543210) is
 * dropped and a bare 10-digit number is Indian. The database applies the same
 * rule minus the trunk-0 step, so the form sends THIS value — otherwise
 * '09876543210' and '9876543210' would be two different guests.
 */
export function normalisePhone(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10) digits = `91${digits}`;
  return digits.length >= 10 && digits.length <= 15 ? `+${digits}` : null;
}

const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function validateRsvp(form, maxSeats = LIMITS.seatsPerRsvp) {
  const errors = {};
  const name = String(form.name || '').trim();
  const email = String(form.email || '').trim();
  const seats = Number(form.seats);
  if (!name) errors.name = 'Your name, please.';
  else if (name.length > LIMITS.nameMax) errors.name = 'A shorter name, please.';
  if (!normalisePhone(form.phone)) errors.phone = 'A phone number we can reach you on.';
  if (email && (!email.includes('@') || email.length > LIMITS.emailMax)) errors.email = 'That email doesn’t look right.';
  const cap = Math.max(1, Math.min(LIMITS.seatsPerRsvp, maxSeats ?? LIMITS.seatsPerRsvp));
  if (!Number.isInteger(seats) || seats < 1 || seats > cap) errors.seats = `Between 1 and ${cap} places.`;
  return {
    errors,
    value: { name, phone: normalisePhone(form.phone), email: email || null, seats },
  };
}

/** Form values for a new gathering. */
export function emptyOfferingForm() {
  return {
    kind: 'event', title: '', description: '',
    startDate: '', startTime: '18:00', endDate: '', endTime: '20:00',
    location: DEFAULT_LOCATION, price: '', capacity: '', imagePath: null,
  };
}

/** A saved row → form values (IST wall clock). endDate is '' when it ends the same day. */
export function offeringToForm(o) {
  const s = isoToIstParts(o.starts_at);
  const e = isoToIstParts(o.ends_at);
  return {
    kind: o.kind,
    title: o.title || '',
    description: o.description || '',
    startDate: s.date, startTime: s.time,
    endDate: e.date === s.date ? '' : e.date, endTime: e.time,
    location: o.location || DEFAULT_LOCATION,
    price: o.price_inr === null || o.price_inr === undefined ? '' : String(Number(o.price_inr)),
    capacity: o.capacity === null || o.capacity === undefined ? '' : String(o.capacity),
    imagePath: o.image_path || null,
  };
}

/** The same gathering a week (or `days`) later — how weekly classes repeat. */
export function duplicateForm(o, days = 7) {
  const shift = (iso) => new Date(new Date(iso).getTime() + days * DAY_MS).toISOString();
  return offeringToForm({ ...o, starts_at: shift(o.starts_at), ends_at: shift(o.ends_at) });
}

/** Form → { errors, value } where value is the row to save (DB column names). */
export function validateOffering(form) {
  const errors = {};
  const title = String(form.title || '').trim();
  const description = String(form.description || '').trim();
  const location = String(form.location || '').trim() || DEFAULT_LOCATION;

  if (!OFFERING_KINDS.some((k) => k.value === form.kind)) errors.kind = 'Choose event, class or workshop.';
  if (title.length < LIMITS.titleMin) errors.title = 'Give it a title.';
  else if (title.length > LIMITS.titleMax) errors.title = `Keep the title under ${LIMITS.titleMax} characters.`;
  if (description.length > LIMITS.descriptionMax) errors.description = `Keep it under ${LIMITS.descriptionMax} characters.`;
  if (location.length > LIMITS.locationMax) errors.location = 'A shorter location, please.';

  const startsAt = istToIso(form.startDate, form.startTime);
  const endsAt = istToIso(form.endDate || form.startDate, form.endTime);
  if (!startsAt) errors.start = 'Pick a date and start time.';
  if (!endsAt) errors.end = 'Pick an end time.';
  if (startsAt && endsAt) {
    const span = new Date(endsAt) - new Date(startsAt);
    if (span <= 0) errors.end = 'It has to end after it starts.';
    else if (span > LIMITS.maxDays * DAY_MS) errors.end = `Up to ${LIMITS.maxDays} days at most.`;
  }

  let price = null;
  if (!blank(form.price)) {
    price = Number(form.price);
    if (!Number.isFinite(price) || price < 0 || Math.round(price * 100) !== price * 100 || price > 99999999) {
      errors.price = 'A price in rupees, or leave it blank for free.';
    }
  }
  let capacity = null;
  if (!blank(form.capacity)) {
    capacity = Number(form.capacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > LIMITS.capacityMax) {
      errors.capacity = `A number of places from 1 to ${LIMITS.capacityMax}, or blank for open.`;
    }
  }

  return {
    errors,
    value: {
      kind: form.kind,
      title,
      description: description || null,
      starts_at: startsAt,
      ends_at: endsAt,
      location,
      price_inr: price === 0 ? null : price,
      capacity,
      image_path: form.imagePath || null,
    },
  };
}

/** Publishing something already under way would open RSVPs that the database refuses. */
export const canPublish = (o, now = Date.now()) => !hasStarted(o, now);

/** Host dashboard tabs. Upcoming: live or cancelled, not yet over. Past: over, newest first. */
export function splitHostOfferings(rows, now = Date.now()) {
  const byStart = (a, b) => new Date(a.starts_at) - new Date(b.starts_at);
  const drafts = rows.filter((o) => o.status === 'draft').sort(byStart);
  const live = rows.filter((o) => o.status !== 'draft');
  return {
    upcoming: live.filter((o) => !isPast(o, now)).sort(byStart),
    drafts,
    past: live.filter((o) => isPast(o, now)).sort((a, b) => byStart(b, a)),
  };
}

/** { [offering_id]: confirmed seats } from the host's RSVP rows. */
export function seatsTaken(rsvps) {
  const out = {};
  for (const r of rsvps) {
    if (r.status !== 'confirmed') continue;
    out[r.offering_id] = (out[r.offering_id] || 0) + Number(r.seats || 0);
  }
  return out;
}

/** What a visitor reads when sanctuary_rsvp() refuses. */
export function rsvpErrorMessage(error) {
  const key = error && String(error.message || '').trim();
  return RSVP_ERROR_COPY[key] || 'Something went wrong — please try again, or message us on WhatsApp.';
}

const calStamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** "Add to Google Calendar" link for a gathering. */
export function googleCalendarUrl(o, pageUrl) {
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: o.title,
    dates: `${calStamp(o.starts_at)}/${calStamp(o.ends_at)}`,
    details: [o.host_name ? `With ${o.host_name}` : '', pageUrl || ''].filter(Boolean).join('\n'),
    location: o.location || DEFAULT_LOCATION,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

/** Route params are user input — only a uuid reaches the database. */
export const isUuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s || ''));

// ── Host sign-in by email code ──────────────────────────────────────────────

/** A plausible address, trimmed and lower-cased, or null. */
export function cleanEmail(s) {
  const e = String(s || '').trim().toLowerCase();
  return e.length <= LIMITS.emailMax && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}

/** The code as typed ("123 456", "123-456") → digits, or null. Supabase sends 6–10. */
export function cleanCode(s) {
  const d = String(s || '').replace(/[\s-]/g, '');
  return /^\d{6,10}$/.test(d) ? d : null;
}

/**
 * Sort a Supabase Auth error into what the host is told (HOST_AUTH_COPY).
 * Reads both shapes GoTrue returns: `code` (new API) / `error_code` (old) and the message.
 */
export function authErrorKind(e) {
  if (!e) return null;
  const s = `${e.code || ''} ${e.error_code || ''} ${e.message || ''}`;
  if (/signup_disabled|otp_disabled|provider_disabled|address_not_authorized|signups not allowed|logins are disabled|not authorized|provider is not enabled/i.test(s)) return 'not_open';
  if (e.status === 429 || /rate_limit|rate limit|only request this after/i.test(s)) return 'slow_down';
  if (/email_address_invalid|email address .* is invalid/i.test(s)) return 'bad_email';
  if (/otp_expired|token has expired|is invalid/i.test(s)) return 'bad_code';
  return 'other';
}
