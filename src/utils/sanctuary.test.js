import {
  istToIso, isoToIstParts, formatDay, formatClock, formatWhen, dateBlock, monthLabel, groupByMonth,
  kindLabel, filterByKind, priceLabel, seatsLabel, isFull, rsvpState, normalisePhone,
  validateRsvp, validateOffering, emptyOfferingForm, offeringToForm, duplicateForm,
  splitHostOfferings, seatsTaken, rsvpErrorMessage, googleCalendarUrl, isUuid, canPublish,
  cleanEmail, cleanCode, authErrorKind,
  weekdayOf, addDays, seriesDates, repeatLabel, weekdaysOf, validateRepeat, seriesRows, seriesSummary,
  durationMinutes, collapseSeries, groupHostSeries, istToday, shiftMonth, monthTitle, monthGrid, byDay,
} from './sanctuary';
import { OFFERING_KINDS, RSVP_ERROR_COPY, HOST_AUTH_COPY } from '../constants/sanctuary';

// 7:00 am IST on Tue 10 Nov 2026 = 01:30 UTC
const SEVEN_IST = '2026-11-10T01:30:00.000Z';

describe('IST wall clock ↔ instant', () => {
  test('a wall-clock time in Auroville becomes the right instant', () => {
    expect(istToIso('2026-11-10', '07:00')).toBe(SEVEN_IST);
    expect(istToIso('2026-11-10', '23:30')).toBe('2026-11-10T18:00:00.000Z');
  });

  test('round-trips', () => {
    expect(isoToIstParts(SEVEN_IST)).toEqual({ date: '2026-11-10', time: '07:00' });
    expect(isoToIstParts('2026-11-10T18:30:00Z')).toEqual({ date: '2026-11-11', time: '00:00' });
  });

  test('refuses malformed or impossible input instead of rolling it over', () => {
    expect(istToIso('2026-02-30', '10:00')).toBeNull();
    expect(istToIso('2026-11-10', '24:00')).toBeNull();
    expect(istToIso('10/11/2026', '07:00')).toBeNull();
    expect(istToIso('', '07:00')).toBeNull();
    expect(isoToIstParts('nonsense')).toEqual({ date: '', time: '' });
  });
});

describe('labels', () => {
  test('day and clock', () => {
    expect(formatDay(SEVEN_IST)).toBe('Tue 10 Nov');
    expect(formatClock(SEVEN_IST)).toBe('7 am');
    expect(formatClock('2026-11-10T02:45:00Z')).toBe('8:15 am');
    expect(formatClock('2026-11-10T13:00:00Z')).toBe('6:30 pm');
  });

  test('one line for the time, same day and multi-day', () => {
    expect(formatWhen(SEVEN_IST, '2026-11-10T02:45:00Z')).toBe('Tue 10 Nov · 7 – 8:15 am');
    expect(formatWhen('2026-11-10T05:30:00Z', '2026-11-10T07:30:00Z')).toBe('Tue 10 Nov · 11 am – 1 pm');
    expect(formatWhen('2026-11-14T04:30:00Z', '2026-11-15T10:30:00Z')).toBe('Sat 14 Nov, 10 am – Sun 15 Nov, 4 pm');
  });

  test('date tile and month heading use IST, not UTC', () => {
    // 20:00 UTC on 30 Nov is already 1 Dec in Auroville
    expect(dateBlock('2026-11-30T20:00:00Z')).toEqual({ weekday: 'Tue', day: '1', month: 'Dec' });
    expect(monthLabel('2026-11-30T20:00:00Z')).toBe('December 2026');
  });

  test('groups consecutive gatherings by month', () => {
    const g = groupByMonth([
      { id: 1, starts_at: '2026-11-10T01:30:00Z' },
      { id: 2, starts_at: '2026-11-28T01:30:00Z' },
      { id: 3, starts_at: '2026-12-02T01:30:00Z' },
    ]);
    expect(g.map((x) => [x.key, x.items.map((i) => i.id)])).toEqual([
      ['November 2026', [1, 2]],
      ['December 2026', [3]],
    ]);
  });

  test('kinds', () => {
    expect(kindLabel('class')).toBe('Class');
    expect(kindLabel('workshop', true)).toBe('Workshops');
    expect(kindLabel('retreat')).toBe('');
    expect(OFFERING_KINDS.map((k) => k.value)).toEqual(['event', 'class', 'workshop']);
    const items = [{ kind: 'event' }, { kind: 'class' }, { kind: 'class' }];
    expect(filterByKind(items, 'all')).toHaveLength(3);
    expect(filterByKind(items, 'class')).toHaveLength(2);
  });

  test('price: free unless a positive amount', () => {
    expect(priceLabel(null)).toBe('Free');
    expect(priceLabel(0)).toBe('Free');
    expect(priceLabel('0.00')).toBe('Free');
    expect(priceLabel(2500)).toBe('₹2,500');
    expect(priceLabel('1500.50')).toBe('₹1,500.5');
  });

  test('seats: NULL capacity is unlimited, never "full"', () => {
    expect(seatsLabel(null, null)).toBe('Open to all');
    expect(isFull({ capacity: null, seats_left: null })).toBe(false);
    expect(seatsLabel(0, 8)).toBe('Full');
    expect(isFull({ capacity: 8, seats_left: 0 })).toBe(true);
    expect(seatsLabel(1, 8)).toBe('Last place');
    expect(seatsLabel(3, 8)).toBe('Last 3 places');
    expect(seatsLabel(9, 12)).toBe('9 places left');
  });
});

describe('rsvpState mirrors the database', () => {
  const now = new Date('2026-11-09T00:00:00Z').getTime();
  const base = { status: 'published', starts_at: SEVEN_IST, ends_at: '2026-11-10T02:45:00Z', capacity: 12, seats_left: 4 };
  test.each([
    ['open', base],
    ['full', { ...base, seats_left: 0 }],
    ['cancelled', { ...base, status: 'cancelled' }],
    ['started', { ...base, starts_at: '2026-11-08T23:00:00Z', ends_at: '2026-11-09T02:00:00Z' }],
    ['past', { ...base, starts_at: '2026-11-01T01:30:00Z', ends_at: '2026-11-01T03:00:00Z' }],
    ['open', { ...base, capacity: null, seats_left: null }],
  ])('%s', (want, o) => expect(rsvpState(o, now)).toBe(want));
  test('missing', () => expect(rsvpState(null)).toBe('missing'));
  test('canPublish only before it starts', () => {
    expect(canPublish(base, now)).toBe(true);
    expect(canPublish({ ...base, starts_at: '2026-11-08T00:00:00Z' }, now)).toBe(false);
  });
});

describe('phone', () => {
  test('normalises like sanctuary_rsvp()', () => {
    expect(normalisePhone('98765 43210')).toBe('+919876543210');
    expect(normalisePhone('+91 98765-43210')).toBe('+919876543210');
    expect(normalisePhone('+33 6 12 34 56 78')).toBe('+33612345678');
    // trunk 0: the same guest as 9876543210, not a different identity
    expect(normalisePhone('09876543210')).toBe('+919876543210');
    expect(normalisePhone('12345')).toBeNull();
    expect(normalisePhone('')).toBeNull();
  });
});

describe('validateRsvp', () => {
  test('a good reservation', () => {
    const { errors, value } = validateRsvp({ name: '  Meera ', phone: '9876543210', email: '', seats: '2' });
    expect(errors).toEqual({});
    expect(value).toEqual({ name: 'Meera', phone: '+919876543210', email: null, seats: 2 });
  });

  test('names each problem', () => {
    const { errors } = validateRsvp({ name: ' ', phone: '123', email: 'nope', seats: 0 });
    expect(Object.keys(errors).sort()).toEqual(['email', 'name', 'phone', 'seats']);
  });

  test('seats capped by what is left and by the per-booking limit', () => {
    expect(validateRsvp({ name: 'A', phone: '9876543210', seats: 3 }, 2).errors.seats).toBe('Between 1 and 2 places.');
    expect(validateRsvp({ name: 'A', phone: '9876543210', seats: 7 }, null).errors.seats).toBe('Between 1 and 6 places.');
  });
});

describe('validateOffering', () => {
  const good = {
    ...emptyOfferingForm(), kind: 'class', title: 'Morning Hatha', startDate: '2026-11-10',
    startTime: '07:00', endTime: '08:15', capacity: '12', price: '',
  };

  test('builds the row in DB column names', () => {
    const { errors, value } = validateOffering(good);
    expect(errors).toEqual({});
    expect(value).toEqual({
      kind: 'class', title: 'Morning Hatha', description: null,
      starts_at: SEVEN_IST, ends_at: '2026-11-10T02:45:00.000Z',
      location: 'Conscious Sanctuary, Auroville Road', price_inr: null, capacity: 12, image_path: null,
    });
  });

  test('a multi-day workshop uses its end date', () => {
    const { value, errors } = validateOffering({ ...good, endDate: '2026-11-11', endTime: '16:00' });
    expect(errors).toEqual({});
    expect(value.ends_at).toBe('2026-11-11T10:30:00.000Z');
  });

  test('refuses an end before the start, and anything over 14 days', () => {
    expect(validateOffering({ ...good, endTime: '06:00' }).errors.end).toBe('It has to end after it starts.');
    expect(validateOffering({ ...good, endDate: '2026-11-30' }).errors.end).toBe('Up to 14 days at most.');
  });

  test('price and capacity', () => {
    expect(validateOffering({ ...good, price: '0' }).value.price_inr).toBeNull();
    expect(validateOffering({ ...good, price: '1500' }).value.price_inr).toBe(1500);
    expect(validateOffering({ ...good, price: '-1' }).errors.price).toBeTruthy();
    expect(validateOffering({ ...good, price: '10.005' }).errors.price).toBeTruthy();
    expect(validateOffering({ ...good, capacity: '' }).value.capacity).toBeNull();
    expect(validateOffering({ ...good, capacity: '2.5' }).errors.capacity).toBeTruthy();
    expect(validateOffering({ ...good, capacity: '0' }).errors.capacity).toBeTruthy();
  });

  test('kind and title', () => {
    expect(validateOffering({ ...good, kind: 'retreat' }).errors.kind).toBeTruthy();
    expect(validateOffering({ ...good, title: 'Yo' }).errors.title).toBeTruthy();
  });
});

describe('forms from saved rows', () => {
  const row = {
    kind: 'workshop', title: 'Clay', description: 'Hands in the earth', starts_at: '2026-11-14T04:30:00Z',
    ends_at: '2026-11-14T10:30:00Z', location: 'The shala', price_inr: '2500.00', capacity: 8, image_path: 'u/1.jpg',
  };

  test('offeringToForm reads IST and leaves endDate blank for a same-day one', () => {
    expect(offeringToForm(row)).toEqual({
      kind: 'workshop', title: 'Clay', description: 'Hands in the earth', startDate: '2026-11-14', startTime: '10:00',
      endDate: '', endTime: '16:00', location: 'The shala', price: '2500', capacity: '8', imagePath: 'u/1.jpg',
    });
  });

  test('duplicateForm is the same gathering a week later', () => {
    const f = duplicateForm(row);
    expect([f.startDate, f.startTime, f.endTime, f.title]).toEqual(['2026-11-21', '10:00', '16:00', 'Clay']);
    expect(validateOffering(f).errors).toEqual({});
  });
});

describe('host dashboard', () => {
  const now = new Date('2026-11-09T00:00:00Z').getTime();
  test('splits drafts, upcoming and past', () => {
    const rows = [
      { id: 'a', status: 'published', starts_at: '2026-11-20T01:30:00Z', ends_at: '2026-11-20T03:00:00Z' },
      { id: 'b', status: 'draft', starts_at: '2026-11-25T01:30:00Z', ends_at: '2026-11-25T03:00:00Z' },
      { id: 'c', status: 'published', starts_at: '2026-11-01T01:30:00Z', ends_at: '2026-11-01T03:00:00Z' },
      { id: 'd', status: 'cancelled', starts_at: '2026-11-12T01:30:00Z', ends_at: '2026-11-12T03:00:00Z' },
      { id: 'e', status: 'published', starts_at: '2026-10-01T01:30:00Z', ends_at: '2026-10-01T03:00:00Z' },
    ];
    const s = splitHostOfferings(rows, now);
    expect(s.upcoming.map((o) => o.id)).toEqual(['d', 'a']);
    expect(s.drafts.map((o) => o.id)).toEqual(['b']);
    expect(s.past.map((o) => o.id)).toEqual(['c', 'e']);
  });

  test('seatsTaken counts confirmed seats only', () => {
    expect(seatsTaken([
      { offering_id: 'a', seats: 2, status: 'confirmed' },
      { offering_id: 'a', seats: 1, status: 'cancelled' },
      { offering_id: 'a', seats: 3, status: 'confirmed' },
      { offering_id: 'b', seats: 1, status: 'confirmed' },
    ])).toEqual({ a: 5, b: 1 });
  });
});

describe('misc', () => {
  test('every database refusal has visitor copy', () => {
    for (const key of ['invalid', 'not_found', 'closed', 'too_many', 'already_booked', 'full']) {
      expect(rsvpErrorMessage({ message: key })).toBe(RSVP_ERROR_COPY[key]);
    }
    expect(rsvpErrorMessage(new Error('Failed to fetch'))).toMatch(/try again/);
    expect(rsvpErrorMessage(null)).toMatch(/try again/);
  });

  test('google calendar link carries UTC stamps', () => {
    const url = googleCalendarUrl(
      { title: 'Morning Hatha', starts_at: SEVEN_IST, ends_at: '2026-11-10T02:45:00Z', host_name: 'Asha', location: 'The shala' },
      'https://consciouscafe.in/sanctuary/x'
    );
    expect(url).toContain('dates=20261110T013000Z%2F20261110T024500Z');
    expect(url).toContain('text=Morning+Hatha');
  });

  test('isUuid', () => {
    expect(isUuid('6f1c2a9e-3b7d-4e2a-9c1f-0a5b8d7e6f40')).toBe(true);
    expect(isUuid('../etc')).toBe(false);
  });
});

describe('host sign-in by email code', () => {
  test('cleanEmail trims, lower-cases, refuses junk', () => {
    expect(cleanEmail('  Asha.Rao@Example.com ')).toBe('asha.rao@example.com');
    expect(cleanEmail('asha@example')).toBeNull();
    expect(cleanEmail('asha example.com')).toBeNull();
    expect(cleanEmail('')).toBeNull();
    expect(cleanEmail(`${'a'.repeat(200)}@x.in`)).toBeNull();
  });

  test('cleanCode accepts the code however it was pasted', () => {
    expect(cleanCode('123456')).toBe('123456');
    expect(cleanCode(' 123 456 ')).toBe('123456');
    expect(cleanCode('123-456')).toBe('123456');
    expect(cleanCode('12345')).toBeNull();
    expect(cleanCode('12345a')).toBeNull();
  });

  test('authErrorKind reads both GoTrue error shapes', () => {
    // new API: { code, message }; old: { error_code, msg } — supabase-js puts either in .code
    expect(authErrorKind({ status: 422, code: 'signup_disabled', message: 'Signups not allowed for this instance' })).toBe('not_open');
    expect(authErrorKind({ status: 422, code: 'otp_disabled', message: 'Signups not allowed for otp' })).toBe('not_open');
    expect(authErrorKind({ status: 400, code: 'email_provider_disabled', message: 'Email logins are disabled' })).toBe('not_open');
    expect(authErrorKind({ status: 400, code: 'email_address_not_authorized', message: 'Email address not authorized' })).toBe('not_open');
    expect(authErrorKind({ status: 429, code: 'over_email_send_rate_limit', message: 'For security purposes, you can only request this after 41 seconds.' })).toBe('slow_down');
    expect(authErrorKind({ status: 403, code: 'otp_expired', message: 'Token has expired or is invalid' })).toBe('bad_code');
    expect(authErrorKind({ status: 400, code: 'email_address_invalid', message: 'Email address "x@y" is invalid' })).toBe('bad_email');
    expect(authErrorKind({ status: 0, message: 'Failed to fetch' })).toBe('other');
    expect(authErrorKind(null)).toBeNull();
  });

  test('every kind has copy', () => {
    for (const k of ['not_open', 'slow_down', 'bad_code', 'bad_email', 'other']) expect(HOST_AUTH_COPY[k]).toBeTruthy();
  });
});

describe('weekly series', () => {
  test('calendar-date maths ignores timezones', () => {
    expect(weekdayOf('2026-11-10')).toBe(2); // a Tuesday
    expect(weekdayOf('nope')).toBeNull();
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30'); // across a DST change elsewhere
  });

  test('seriesDates picks the chosen weekdays, both ends included', () => {
    expect(seriesDates('2026-11-10', '2026-11-24', [2])).toEqual(['2026-11-10', '2026-11-17', '2026-11-24']);
    expect(seriesDates('2026-11-10', '2026-11-19', [2, 4])).toEqual(['2026-11-10', '2026-11-12', '2026-11-17', '2026-11-19']);
    expect(seriesDates('2026-11-10', '2026-11-09', [2])).toEqual([]);
    expect(seriesDates('2026-11-10', '2026-11-24', [])).toEqual([]);
  });

  test('repeatLabel reads naturally, Monday first', () => {
    expect(repeatLabel([2])).toBe('Every Tue');
    expect(repeatLabel([4, 2])).toBe('Every Tue & Thu');
    expect(repeatLabel([1, 3, 5])).toBe('Every Mon, Wed & Fri');
    expect(repeatLabel([0, 1, 2, 3, 4, 5, 6])).toBe('Every day');
  });

  test('weekdaysOf reads the IST day, not the UTC one', () => {
    // 05:00 IST Wed = 23:30 UTC Tue
    expect(weekdaysOf([{ starts_at: '2026-11-10T23:30:00Z' }])).toEqual([3]);
  });

  const base = { repeat: 'weekly', startDate: '2026-11-10', weekdays: [2], untilDate: '2026-12-29' };
  test('validateRepeat: once, weekly, and the limits', () => {
    expect(validateRepeat({ repeat: 'once', startDate: '2026-11-10' })).toEqual({ errors: {}, dates: ['2026-11-10'] });
    expect(validateRepeat(base).dates).toHaveLength(8);
    expect(validateRepeat({ ...base, weekdays: [] }).errors.repeat).toMatch(/at least one day/);
    expect(validateRepeat({ ...base, untilDate: '' }).errors.repeat).toMatch(/last date/);
    expect(validateRepeat({ ...base, untilDate: '2026-11-01' }).errors.repeat).toMatch(/after the first/);
    expect(validateRepeat({ ...base, untilDate: '2026-11-12' }).errors.repeat).toMatch(/only one date/);
    expect(validateRepeat({ ...base, untilDate: '2027-12-01' }).errors.repeat).toMatch(/26 weeks/);
    expect(validateRepeat({ ...base, weekdays: [1, 2, 3, 4, 5, 6, 0], untilDate: '2027-01-30' }).errors.repeat).toMatch(/more than 26/);
  });

  test('seriesRows: same IST times on every date; a multi-day span is kept', () => {
    const form = { startDate: '2026-11-10', startTime: '07:00', endDate: '', endTime: '08:15' };
    const rows = seriesRows(form, { title: 'Hatha', starts_at: 'x', ends_at: 'y' }, ['2026-11-10', '2026-11-17'], 'S1');
    expect(rows).toEqual([
      { title: 'Hatha', series_id: 'S1', starts_at: '2026-11-10T01:30:00.000Z', ends_at: '2026-11-10T02:45:00.000Z' },
      { title: 'Hatha', series_id: 'S1', starts_at: '2026-11-17T01:30:00.000Z', ends_at: '2026-11-17T02:45:00.000Z' },
    ]);
    const weekend = seriesRows({ startDate: '2026-11-14', startTime: '10:00', endDate: '2026-11-15', endTime: '17:00' }, {}, ['2026-11-21'], 'S2');
    expect(weekend[0].ends_at).toBe('2026-11-22T11:30:00.000Z');
  });

  test('seriesSummary and durationMinutes', () => {
    expect(seriesSummary(['2026-11-10', '2026-11-17', '2026-12-29'])).toBe('3 dates · Tue 10 Nov → Tue 29 Dec');
    expect(durationMinutes({ starts_at: '2026-11-10T01:30:00Z', ends_at: '2026-11-10T02:45:00Z' })).toBe(75);
  });

  test('collapseSeries keeps one entry per series, in date order', () => {
    const items = [
      { id: 'a', series_id: 'S', starts_at: '2026-11-10T01:30:00Z' },
      { id: 'b', series_id: null, starts_at: '2026-11-11T12:00:00Z' },
      { id: 'c', series_id: 'S', starts_at: '2026-11-12T01:30:00Z' },
      { id: 'd', series_id: 'S', starts_at: '2026-11-17T01:30:00Z' },
    ];
    const out = collapseSeries(items);
    expect(out.map((o) => o.id)).toEqual(['a', 'b']);
    expect(out[0].more).toBe(2);
    expect(out[0].repeat).toBe('Every Tue & Thu');
  });

  test('groupHostSeries groups a series where it first appears; a lone date stays a row', () => {
    const rows = [
      { id: 'a', series_id: 'S' }, { id: 'b', series_id: null }, { id: 'c', series_id: 'S' }, { id: 'd', series_id: 'T' },
    ];
    const g = groupHostSeries(rows);
    expect(g.map((x) => x.key)).toEqual(['S', 'b', 'd']);
    expect(g[0].series.map((o) => o.id)).toEqual(['a', 'c']);
    expect(g[2].row.id).toBe('d');
  });
});

describe('calendar view', () => {
  test('istToday is the Auroville date', () => {
    expect(istToday(Date.parse('2026-11-10T19:00:00Z'))).toBe('2026-11-11'); // 00:30 IST next day
  });

  test('month helpers', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(monthTitle('2026-11')).toBe('November 2026');
  });

  test('monthGrid: Monday-first weeks covering the whole month', () => {
    const g = monthGrid('2026-11'); // 1 Nov 2026 is a Sunday
    expect(g[0][0]).toEqual({ date: '2026-10-26', day: 26, inMonth: false });
    expect(g[0][6]).toEqual({ date: '2026-11-01', day: 1, inMonth: true });
    expect(g[g.length - 1].some((c) => c.date === '2026-11-30')).toBe(true);
    expect(g.every((w) => w.length === 7)).toBe(true);
    expect(monthGrid('2027-02')).toHaveLength(4); // Feb 2027 starts on a Monday and ends on a Sunday
  });

  test('byDay buckets by the IST date', () => {
    const m = byDay([{ id: 'x', starts_at: '2026-11-10T19:00:00Z' }, { id: 'y', starts_at: '2026-11-11T03:00:00Z' }]);
    expect(Object.keys(m)).toEqual(['2026-11-11']);
    expect(m['2026-11-11'].map((o) => o.id)).toEqual(['x', 'y']);
  });
});
