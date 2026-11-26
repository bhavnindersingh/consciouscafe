/**
 * Conscious Sanctuary — pure rules: IST date/time maths, labels, validation.
 *
 * Every time is stored as a timestamptz and shown in Asia/Kolkata. A host types
 * a date and a clock time "as on the wall in Auroville"; istToIso() turns that
 * into an instant with an explicit +05:30, so a browser in another timezone
 * can't shift it. Never `new Date('YYYY-MM-DD')` — that is midnight UTC.
 */
import { OFFERING_KINDS, LIMITS, DEFAULT_LOCATION, RSVP_ERROR_COPY, WEEKDAYS } from '../constants/sanctuary';

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
const longDayFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' });

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
    return `${formatDay(startsIso)} · ${formatTimes(startsIso, endsIso)}`;
  }
  return `${formatDay(startsIso)}, ${formatClock(startsIso)} – ${formatDay(endsIso)}, ${formatClock(endsIso)}`;
}

/**
 * Just the time, for a list already under its day (the calendar pop-up):
 *   '7 – 8:15 am', '11 am – 1 pm', or '10 am – Sun 15 Nov, 4 pm' past midnight.
 */
export function formatTimes(startsIso, endsIso) {
  const s = new Date(startsIso);
  const e = new Date(endsIso);
  if (!valid(s)) return '';
  if (!valid(e)) return formatClock(startsIso);
  if (isoToIstParts(startsIso).date === isoToIstParts(endsIso).date) {
    const samePeriod = parts(clockFmt, s).dayPeriod === parts(clockFmt, e).dayPeriod;
    return `${samePeriod ? formatClock(startsIso, false) : formatClock(startsIso)} – ${formatClock(endsIso)}`;
  }
  return `${formatClock(startsIso)} – ${formatDay(endsIso)}, ${formatClock(endsIso)}`;
}

/** 'Thursday 3 December' — the day picked on the calendar. */
export function formatLongDay(iso) {
  const p = parts(longDayFmt, new Date(iso));
  return `${p.weekday} ${p.day} ${p.month}`;
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

// ── Video ─────────────────────────────────────────────────────────────────

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const IG_ID = /^[A-Za-z0-9_-]{5,40}$/;
const VIMEO_HASH = /^[0-9a-f]{6,20}$/i;
const VIDEO_PROVIDERS = { youtube: 'YouTube', vimeo: 'Vimeo', instagram: 'Instagram' };

/**
 * A pasted video link → { provider, label, id, url, embed, vertical } or null.
 *
 * `url` is the canonical link we store; `embed` is the iframe address, built
 * only from the provider and the id parsed here — never the text as typed. The
 * column is a host's own text, so the page parses it again before showing it.
 * YouTube: watch?v=, youtu.be/, shorts/, embed/, live/. Vimeo: vimeo.com/<n>
 * (+ an unlisted hash), player.vimeo.com/video/<n>?h=. Instagram: reel/, p/, tv/.
 */
export function parseVideoLink(raw) {
  let s = String(raw || '').trim();
  if (!s || /\s/.test(s)) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = `https://${s}`;
  let u;
  try { u = new URL(s); } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const host = u.hostname.toLowerCase().replace(/^(www|m|music)\./, '');
  const seg = u.pathname.split('/').filter(Boolean);
  const make = (provider, id, url, embed, vertical = false) => ({ provider, label: VIDEO_PROVIDERS[provider], id, url, embed, vertical });

  if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'youtu.be') {
    let id = null;
    let shorts = false;
    if (host === 'youtu.be') id = seg[0];
    else if (seg[0] === 'watch') id = u.searchParams.get('v');
    else if (['shorts', 'embed', 'live', 'v'].includes(seg[0])) { id = seg[1]; shorts = seg[0] === 'shorts'; }
    if (!id || !YT_ID.test(id)) return null;
    return make('youtube', id,
      shorts ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
      `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`, shorts);
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const at = host === 'player.vimeo.com' ? (seg[0] === 'video' ? 1 : -1) : seg.findIndex((p) => /^\d+$/.test(p));
    const id = at >= 0 ? seg[at] : null;
    if (!id || !/^\d{1,12}$/.test(id)) return null;
    const h = host === 'player.vimeo.com' ? u.searchParams.get('h') : seg[at + 1];
    const hash = h && VIMEO_HASH.test(h) ? h.toLowerCase() : null;
    return make('vimeo', id,
      `https://vimeo.com/${id}${hash ? `/${hash}` : ''}`,
      `https://player.vimeo.com/video/${id}?dnt=1${hash ? `&h=${hash}` : ''}`);
  }
  if (host === 'instagram.com') {
    const at = seg.findIndex((p) => ['reel', 'reels', 'p', 'tv'].includes(p));
    const id = at >= 0 ? seg[at + 1] : null;
    if (!id || !IG_ID.test(id)) return null;
    const kind = seg[at] === 'p' ? 'p' : 'reel';
    return make('instagram', id, `https://www.instagram.com/${kind}/${id}/`, `https://www.instagram.com/${kind}/${id}/embed/`, true);
  }
  return null;
}

/**
 * A link someone else typed, safe to put in an href: an https address with no
 * spaces or quotes, else null (an organiser's own link, on their profile).
 */
export const safeHttpsLink = (link) => (typeof link === 'string' && /^https:\/\/[^\s"'<>]+\.[^\s"'<>]+$/i.test(link.trim()) ? link.trim() : null);

/**
 * Form values for a new event. `where` is 'sanctuary' (the one room — the
 * calendar) or 'outside' (anywhere else — Linda's curation); `location` is the
 * place when it's outside ('' at the Sanctuary, which has one address).
 */
export function emptyOfferingForm() {
  return {
    kind: 'event', title: '', description: '',
    startDate: '', startTime: '18:00', endDate: '', endTime: '20:00',
    where: 'sanctuary', location: '', price: '', capacity: '', imagePath: null,
    videoMode: 'link', videoUrl: '', videoPath: null,
  };
}

/** Typed as a place but naming the Sanctuary — which is "At Conscious Sanctuary", one room with a calendar. */
export const looksLikeSanctuary = (place) => /conscious\s*sanctuary/i.test(String(place || ''));

/**
 * A form from before `where` existed (a draft kept in this browser) → the same
 * form with it: the Sanctuary's own address means in-house, anything else outside.
 */
export function withWhere(form) {
  if (form.where === 'sanctuary' || form.where === 'outside') return form;
  const place = elsewhere(form.location);
  return { ...form, where: place ? 'outside' : 'sanctuary', location: place };
}

/** In the Sanctuary (the calendar) rather than outside it (Linda's curation). A row without the flag: by its place. */
export const inHouse = (o) => (typeof o.at_sanctuary === 'boolean' ? o.at_sanctuary : !elsewhere(o.location));

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
    where: inHouse(o) ? 'sanctuary' : 'outside',
    location: inHouse(o) ? '' : (o.location || ''),
    price: o.price_inr === null || o.price_inr === undefined ? '' : String(Number(o.price_inr)),
    capacity: o.capacity === null || o.capacity === undefined ? '' : String(o.capacity),
    imagePath: o.image_path || null,
    videoMode: o.video_path ? 'upload' : 'link',
    videoUrl: o.video_url || '',
    videoPath: o.video_path || null,
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
  const outside = form.where === 'outside';
  const place = String(form.location || '').trim();

  if (!OFFERING_KINDS.some((k) => k.value === form.kind)) errors.kind = 'Choose event, class or workshop.';
  if (title.length < LIMITS.titleMin) errors.title = 'Give it a title.';
  else if (title.length > LIMITS.titleMax) errors.title = `Keep the title under ${LIMITS.titleMax} characters.`;
  if (description.length > LIMITS.descriptionMax) errors.description = `Keep it under ${LIMITS.descriptionMax} characters.`;
  if (outside) {
    if (place.length < 2) errors.location = 'Write where it happens, so people can find it.';
    else if (place.length > LIMITS.locationMax) errors.location = 'A shorter place, please.';
    else if (looksLikeSanctuary(place)) errors.location = 'That’s the Sanctuary — choose “At Conscious Sanctuary” above instead.';
  }

  const startsAt = istToIso(form.startDate, form.startTime);
  const endsAt = istToIso(form.endDate || form.startDate, form.endTime);
  if (!startsAt) errors.start = 'Pick a date and start time.';
  // No date yet is the start's error; only blame the end when its own time is missing.
  if (!endsAt && (startsAt || !TIME_RE.test(form.endTime || ''))) errors.end = 'Pick an end time.';
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

  // One video at most: the tab the host left open decides which one is kept.
  let videoUrl = null;
  let videoPath = null;
  if (form.videoMode === 'upload') {
    videoPath = form.videoPath || null;
  } else if (!blank(form.videoUrl)) {
    const v = parseVideoLink(form.videoUrl);
    if (!v) errors.video = 'Paste a link to a YouTube, Vimeo or Instagram video.';
    else if (v.url.length > LIMITS.videoUrlMax) errors.video = 'That link is too long.';
    else videoUrl = v.url;
  }

  return {
    errors,
    value: {
      kind: form.kind,
      title,
      description: description || null,
      starts_at: startsAt,
      ends_at: endsAt,
      at_sanctuary: !outside,
      location: outside ? place : DEFAULT_LOCATION,
      price_inr: price === 0 ? null : price,
      capacity,
      image_path: form.imagePath || null,
      video_url: videoUrl,
      video_path: videoPath,
    },
  };
}

/** Where it happens, when that isn't the Sanctuary itself ('' at the Sanctuary or unknown). */
export function elsewhere(location) {
  const l = String(location || '').trim();
  return !l || l.toLowerCase() === DEFAULT_LOCATION.toLowerCase() ? '' : l;
}

/** A Google Maps search for a place someone typed. */
export const mapsUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(q || '').trim())}`;

/** Publishing something already under way would open RSVPs that the database refuses. */
export const canPublish = (o, now = Date.now()) => !hasStarted(o, now);

// ── One room ────────────────────────────────────────────────────────────────
// Conscious Sanctuary holds one thing at a time. The database refuses a second
// live event over a taken time (POS migration 20261127000000, constraint
// sanctuary_offerings_one_room); these let the editor say so before anyone saves.

const overlaps = (a, b) => new Date(a.starts_at) < new Date(b.ends_at) && new Date(b.starts_at) < new Date(a.ends_at);

/**
 * The span to ask sanctuary_room_busy() about for these wanted times:
 * { from, to } covering their IST days whole, or null.
 */
export function roomWindow(wanted) {
  const ok = wanted.filter((w) => w.starts_at && w.ends_at);
  if (!ok.length) return null;
  const first = isoToIstParts(ok.reduce((m, w) => (w.starts_at < m ? w.starts_at : m), ok[0].starts_at)).date;
  const last = isoToIstParts(ok.reduce((m, w) => (w.ends_at > m ? w.ends_at : m), ok[0].ends_at)).date;
  return { from: istToIso(first, '00:00'), to: istToIso(addDays(last, 1), '00:00') };
}

/**
 * What the wanted times run into, from sanctuary_room_busy() rows. `mine`: ids
 * to leave out (the event being edited). → { taken, held }: each a list of
 * { want, busy } — taken = a live event (it can't be approved over it), held =
 * someone's event waiting for review (whichever is approved first gets it).
 */
export function roomClashes(busy, wanted, mine = []) {
  const others = busy.filter((b) => !mine.includes(b.id));
  const taken = [];
  const held = [];
  for (const want of wanted) {
    if (!want.starts_at || !want.ends_at) continue;
    for (const b of others) {
      if (!overlaps(want, b)) continue;
      (b.status === 'published' ? taken : held).push({ want, busy: b });
    }
  }
  return { taken, held };
}

/** One busy slot, the way the editor says it: '“Kirtan evening”, Fri 4 Dec, 7 – 9 pm'. */
export const busyLabel = (b) => `${b.title ? `“${b.title}”, ` : ''}${formatWhen(b.starts_at, b.ends_at)}`;

/** The message when the Sanctuary is taken — the same words the database uses. */
export const roomTakenMessage = (b) => `The Sanctuary is taken then: ${busyLabel(b)}. Pick another time, or choose somewhere else.`;

/**
 * Organiser dashboard tabs. Upcoming: live or cancelled, not yet over. Drafts:
 * drafts and events waiting for review (neither is public). Past: over, newest first.
 */
export function splitHostOfferings(rows, now = Date.now()) {
  const byStart = (a, b) => new Date(a.starts_at) - new Date(b.starts_at);
  const notPublic = (o) => o.status === 'draft' || o.status === 'in_review';
  const drafts = rows.filter(notPublic).sort(byStart);
  const live = rows.filter((o) => !notPublic(o));
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

// ── Weekly series ───────────────────────────────────────────────────────────
// A weekly class is N ordinary gatherings sharing a series_id. Dates here are
// calendar dates ('YYYY-MM-DD', as on the wall in Auroville), so the maths is
// done in UTC on purpose — no timezone can shift a day.

const dayNum = (date) => (DATE_RE.test(date || '') ? new Date(`${date}T00:00:00Z`) : null);

/** 0 = Sunday … 6 = Saturday, for a calendar date. */
export function weekdayOf(date) {
  const d = dayNum(date);
  return d && valid(d) ? d.getUTCDay() : null;
}

export function addDays(date, n) {
  const d = dayNum(date);
  if (!d || !valid(d)) return '';
  return new Date(d.getTime() + n * DAY_MS).toISOString().slice(0, 10);
}

const daysBetween = (a, b) => Math.round((dayNum(b) - dayNum(a)) / DAY_MS);

/**
 * Every date from `start` to `until` (both included) that falls on one of
 * `weekdays`. Stops one past the limit so callers can tell "too many".
 */
export function seriesDates(start, until, weekdays) {
  const out = [];
  if (weekdayOf(start) === null || weekdayOf(until) === null || !weekdays?.length) return out;
  const want = new Set(weekdays.map(Number));
  for (let d = start; d <= until && out.length <= LIMITS.seriesMaxDates; d = addDays(d, 1)) {
    if (want.has(weekdayOf(d))) out.push(d);
  }
  return out;
}

/** "Every Tue & Thu" — from weekday numbers, Monday first. */
export function repeatLabel(weekdays) {
  const names = WEEKDAYS.filter((w) => weekdays.includes(w.value)).map((w) => w.short);
  if (!names.length) return '';
  if (names.length === 7) return 'Every day';
  return `Every ${names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`}`;
}

/** The IST weekdays a set of gatherings fall on — for repeatLabel(). */
export const weekdaysOf = (rows) => [...new Set(rows.map((o) => weekdayOf(isoToIstParts(o.starts_at).date)))];

/**
 * The repeat part of the editor → { errors, dates }. `form.repeat` is 'once' or
 * 'weekly'; weekly needs days and an end date, and gives 2..seriesMaxDates dates.
 */
export function validateRepeat(form) {
  const errors = {};
  if (form.repeat !== 'weekly') return { errors, dates: [form.startDate] };
  if (!form.weekdays?.length) errors.repeat = 'Pick at least one day.';
  else if (!DATE_RE.test(form.untilDate || '')) errors.repeat = 'Pick the last date.';
  else if (form.untilDate < form.startDate) errors.repeat = 'The last date comes after the first.';
  else if (daysBetween(form.startDate, form.untilDate) > LIMITS.seriesMaxWeeks * 7) {
    errors.repeat = `Up to ${LIMITS.seriesMaxWeeks} weeks ahead at a time.`;
  }
  if (errors.repeat) return { errors, dates: [] };
  const dates = seriesDates(form.startDate, form.untilDate, form.weekdays);
  if (dates.length < 2) errors.repeat = 'That gives only one date — choose “Once”, or more days.';
  else if (dates.length > LIMITS.seriesMaxDates) errors.repeat = `That’s more than ${LIMITS.seriesMaxDates} dates — pick an earlier last date.`;
  return { errors, dates };
}

/** One saved row per date: same times, same span (a multi-day one stays multi-day). */
export function seriesRows(form, value, dates, seriesId) {
  const span = form.endDate ? daysBetween(form.startDate, form.endDate) : 0;
  return dates.map((date) => ({
    ...value,
    series_id: seriesId,
    starts_at: istToIso(date, form.startTime),
    ends_at: istToIso(addDays(date, span), form.endTime),
  }));
}

/** "8 dates · Tue 10 Nov → Tue 29 Dec" */
export function seriesSummary(dates) {
  if (!dates.length) return '';
  const day = (d) => formatDay(istToIso(d, '12:00'));
  return `${dates.length} dates · ${day(dates[0])} → ${day(dates[dates.length - 1])}`;
}

/** Minutes between a row's start and end — what "this and following" keeps. */
export const durationMinutes = (value) => Math.round((new Date(value.ends_at) - new Date(value.starts_at)) / 60000);

/**
 * How long it runs, for the editor: '45 min', '1 hour', '1 h 30 min', '3 days'.
 * A day or more counts the IST calendar days it touches. '' unless it ends after it starts.
 */
export function durationLabel(startsIso, endsIso) {
  if (!startsIso || !endsIso) return '';
  const mins = Math.round((new Date(endsIso) - new Date(startsIso)) / 60000);
  if (!Number.isFinite(mins) || mins <= 0) return '';
  if (mins >= 24 * 60) return `${daysBetween(isoToIstParts(startsIso).date, isoToIstParts(endsIso).date) + 1} days`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m} min`;
  if (!m) return h === 1 ? '1 hour' : `${h} hours`;
  return `${h} h ${m} min`;
}

/**
 * Public list: one entry per weekly series (its next date) plus every one-off,
 * in date order. Each series entry carries `more` (other dates) and `repeat`.
 */
export function collapseSeries(items) {
  const seen = new Map();
  const out = [];
  for (const o of items) {
    if (!o.series_id) { out.push(o); continue; }
    const head = seen.get(o.series_id);
    if (head) { head.more += 1; head.dates.push(o); continue; }
    const entry = { ...o, more: 0, dates: [o] };
    seen.set(o.series_id, entry);
    out.push(entry);
  }
  for (const e of seen.values()) e.repeat = repeatLabel(weekdaysOf(e.dates));
  return out;
}

/**
 * Host dashboard: a series becomes one group at the place of its first date;
 * one-offs stay single. → [{ key, row }] | [{ key, series: rows[] }]
 */
export function groupHostSeries(rows) {
  const groups = new Map();
  const out = [];
  for (const o of rows) {
    if (!o.series_id) { out.push({ key: o.id, row: o }); continue; }
    let g = groups.get(o.series_id);
    if (!g) { g = { key: o.series_id, series: [] }; groups.set(o.series_id, g); out.push(g); }
    g.series.push(o);
  }
  // A "series" left with one date in this tab reads better as a plain row.
  return out.map((g) => (g.series && g.series.length === 1 ? { key: g.series[0].id, row: g.series[0] } : g));
}

// ── Calendar view ───────────────────────────────────────────────────────────

/** Today's date in Auroville. */
export const istToday = (now = Date.now()) => isoToIstParts(new Date(now).toISOString()).date;

/** 'YYYY-MM' of a date, and n months on. */
export const monthOf = (date) => String(date || '').slice(0, 7);
export function shiftMonth(ym, n) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

/** "November 2026" for 'YYYY-MM'. */
export const monthTitle = (ym) => monthLabel(`${ym}-15T06:30:00Z`);

/** Weeks of a month, Monday first: [[{ date, day, inMonth }, ×7], …]. */
export function monthGrid(ym) {
  const first = `${ym}-01`;
  const lead = (weekdayOf(first) + 6) % 7; // days before the 1st, Monday first
  let d = addDays(first, -lead);
  const weeks = [];
  do {
    const week = [];
    for (let i = 0; i < 7; i += 1, d = addDays(d, 1)) {
      week.push({ date: d, day: Number(d.slice(8)), inMonth: monthOf(d) === ym });
    }
    weeks.push(week);
  } while (monthOf(d) === ym);
  return weeks;
}

/** { 'YYYY-MM-DD': gatherings[] } by IST start date. */
export function byDay(items) {
  const out = {};
  for (const o of items) {
    const k = isoToIstParts(o.starts_at).date;
    (out[k] = out[k] || []).push(o);
  }
  return out;
}
