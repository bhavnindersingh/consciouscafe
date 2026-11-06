import {
  toPaise, quote, rupees, priceLine, gstLabel, orderServices, usesLabel, dayStrip, daysBetween, weekChunkStart,
  groupSlotsByDay, slotsFor, dayHasPlaces, seatCap, placesLabel, slotRange, slotLine, dayTile, dayCaption,
  stillBookable, validateBooking, bookErrorMessage, shouldRefetch, cleanOrderId, isBookingState, keepPolling, stateCopy,
  isNotDeployed,
} from './wellness';
import { SERVICE_KEYS, BOOKING_STATES, BOOK_ERROR_COPY, BOOK_ERROR_FALLBACK, STATUS_POLL_LIMIT_MS } from '../constants/wellness';

// 7:00 am IST on Tue 10 Nov 2026 = 01:30 UTC
const SEVEN = '2026-11-10T01:30:00+00:00';
const EIGHT = '2026-11-10T02:30:00+00:00';
const NOON_IST = Date.parse('2026-11-10T06:30:00Z');

const slot = (service, start, end, left) => ({ service, slot_start: start, slot_end: end, places_left: left });

describe('money — the server’s paise arithmetic', () => {
  test('base, GST and total in paise', () => {
    expect(quote(1200, 1, 18)).toEqual({ basePaise: 120000, gstPaise: 21600, totalPaise: 141600 });
    expect(quote(1200, 3, 18)).toEqual({ basePaise: 360000, gstPaise: 64800, totalPaise: 424800 });
  });

  test('rounds the way round() does, from a decimal price and a fractional rate', () => {
    // 999.99 × 100 = 99999 paise; × 18% = 17999.82 → 18000
    expect(quote('999.99', 1, 18)).toEqual({ basePaise: 99999, gstPaise: 18000, totalPaise: 117999 });
    // 5.5% of 15000 = 825 exactly; of 15001 = 825.055 → 825
    expect(quote(150, 1, 5.5).gstPaise).toBe(825);
    expect(quote(150.01, 1, 5.5).gstPaise).toBe(825);
    // a true half: 12.5% of 100 paise = 12.5 → 13 (half up, as Postgres)
    expect(quote(1, 1, 12.5).gstPaise).toBe(13);
  });

  test('no GST, no seats, bad seats', () => {
    expect(quote(1200, 1, 0)).toEqual({ basePaise: 120000, gstPaise: 0, totalPaise: 120000 });
    expect(quote(1200, 0, 18).totalPaise).toBe(0);
    expect(quote(1200, 'x', 18).totalPaise).toBe(0);
    expect(toPaise('12.345')).toBe(1235);
  });

  test('labels', () => {
    expect(rupees(141600)).toBe('₹1,416');
    expect(rupees(141650)).toBe('₹1,416.50');
    expect(rupees(0)).toBe('₹0');
    expect(rupees(12345678)).toBe('₹1,23,456.78');
    expect(priceLine(1200)).toBe('₹1,200 per person + GST');
    expect(priceLine('850.5')).toBe('₹850.50 per person + GST');
    expect(gstLabel(18)).toBe('GST (18%)');
    expect(gstLabel('18.00')).toBe('GST (18%)');
    expect(gstLabel(5.5)).toBe('GST (5.5%)');
  });
});

describe('services', () => {
  test('vocabulary order, unknown keys dropped', () => {
    const menu = [{ key: 'contrast' }, { key: 'massage' }, { key: 'ice_bath' }, { key: 'sauna' }];
    expect(orderServices(menu).map((s) => s.key)).toEqual(SERVICE_KEYS);
    expect(orderServices(null)).toEqual([]);
  });

  test('what a service uses', () => {
    expect(usesLabel(['ice_bath'])).toBe('Ice bath');
    expect(usesLabel(['sauna', 'ice_bath'])).toBe('Sauna + ice bath');
    expect(usesLabel([])).toBe('');
  });
});

describe('days', () => {
  test('the strip is today and the next book_ahead_days, in IST', () => {
    // 23:00 UTC on 9 Nov is already 10 Nov in Auroville
    const late = Date.parse('2026-11-09T23:00:00Z');
    expect(dayStrip(2, late)).toEqual(['2026-11-10', '2026-11-11', '2026-11-12']);
    expect(dayStrip(0, late)).toEqual(['2026-11-10']);
    expect(dayStrip(14, late)).toHaveLength(15);
    expect(dayStrip(500, late)).toHaveLength(91);
  });

  test('week chunks start on today + 7k', () => {
    expect(weekChunkStart('2026-11-10', '2026-11-10')).toBe('2026-11-10');
    expect(weekChunkStart('2026-11-16', '2026-11-10')).toBe('2026-11-10');
    expect(weekChunkStart('2026-11-17', '2026-11-10')).toBe('2026-11-17');
    expect(weekChunkStart('2026-11-30', '2026-11-10')).toBe('2026-11-24');
    expect(weekChunkStart('2026-11-01', '2026-11-10')).toBe('2026-11-10'); // the past is today
    expect(daysBetween('2026-11-10', '2026-11-17')).toBe(7);
    expect(daysBetween('bad', '2026-11-17')).toBe(0);
  });

  test('tile words and captions', () => {
    expect(dayTile('2026-11-10')).toEqual({ weekday: 'Tue', day: '10', month: 'Nov' });
    expect(dayCaption('2026-11-10', NOON_IST)).toBe('Today');
    expect(dayCaption('2026-11-11', NOON_IST)).toBe('Tomorrow');
    expect(dayCaption('2026-11-12', NOON_IST)).toBe('');
  });
});

describe('slots', () => {
  const rows = [
    slot('sauna', '2026-11-10T03:30:00+00:00', '2026-11-10T04:30:00+00:00', 2),
    slot('ice_bath', SEVEN, EIGHT, 0),
    slot('sauna', SEVEN, EIGHT, 3),
    // 11:30 pm IST on the 10th → still the 10th; 00:30 IST → the 11th
    slot('sauna', '2026-11-10T18:00:00+00:00', '2026-11-10T19:00:00+00:00', 1),
    slot('sauna', '2026-11-10T19:00:00+00:00', '2026-11-10T20:00:00+00:00', 1),
    { service: 'sauna', slot_start: 'garbage', slot_end: 'garbage', places_left: 1 },
  ];

  test('grouped by IST day, each day in time order', () => {
    const g = groupSlotsByDay(rows);
    expect(Object.keys(g).sort()).toEqual(['2026-11-10', '2026-11-11']);
    expect(g['2026-11-10'].map((s) => s.slot_start)).toEqual([SEVEN, SEVEN, '2026-11-10T03:30:00+00:00', '2026-11-10T18:00:00+00:00']);
    expect(g['2026-11-11']).toHaveLength(1);
    expect(groupSlotsByDay(null)).toEqual({});
  });

  test('one service on one day', () => {
    expect(slotsFor(rows, 'sauna', '2026-11-10').map((s) => s.places_left)).toEqual([3, 2, 1]);
    expect(slotsFor(rows, 'ice_bath', '2026-11-10')).toHaveLength(1);
    expect(slotsFor(rows, 'contrast', '2026-11-10')).toEqual([]);
    expect(dayHasPlaces(rows, 'sauna', '2026-11-10')).toBe(true);
    expect(dayHasPlaces(rows, 'ice_bath', '2026-11-10')).toBe(false); // listed, but full
    expect(dayHasPlaces(rows, 'ice_bath', '2026-11-11')).toBe(false);
  });

  test('the seat cap is min(max_seats, places_left), never below 0', () => {
    expect(seatCap(4, 3)).toBe(3);
    expect(seatCap(4, 9)).toBe(4);
    expect(seatCap(4, 0)).toBe(0);
    expect(seatCap(4, -2)).toBe(0);
    expect(seatCap(undefined, 3)).toBe(0);
  });

  test('places and time labels', () => {
    expect(placesLabel(0)).toBe('Full');
    expect(placesLabel(1)).toBe('1 place left');
    expect(placesLabel(3)).toBe('3 places left');
    expect(slotRange(SEVEN, EIGHT)).toBe('7 – 8 am');
    expect(slotRange('2026-11-10T06:00:00Z', '2026-11-10T07:00:00Z')).toBe('11:30 am – 12:30 pm');
    expect(slotRange('2026-11-10T05:30:00Z', '2026-11-10T06:30:00Z')).toBe('11 am – 12 pm');
    expect(slotRange('bad', EIGHT)).toBe('');
    expect(slotLine(SEVEN, EIGHT)).toBe('Tue 10 Nov · 7 – 8 am');
  });

  test('a picked slot survives a refetch only if it is still there with room', () => {
    const picked = slot('sauna', SEVEN, EIGHT, 3);
    expect(stillBookable(rows, picked, 2)).toBe(true);
    expect(stillBookable(rows, picked, 4)).toBe(false);
    expect(stillBookable(rows, slot('ice_bath', SEVEN, EIGHT, 1), 1)).toBe(false); // now full
    expect(stillBookable(rows, slot('contrast', SEVEN, EIGHT, 1), 1)).toBe(false); // gone
    expect(stillBookable(rows, null, 1)).toBe(false);
  });
});

describe('the guest’s details', () => {
  const good = { name: ' Asha ', phone: '098765 43210', email: ' Asha@Example.com ', seats: 2 };

  test('clean values go through; the trunk 0 is dropped', () => {
    const { errors, value } = validateBooking(good, 3);
    expect(errors).toEqual({});
    expect(value).toEqual({ name: 'Asha', phone: '+919876543210', email: 'asha@example.com', seats: 2 });
  });

  test('email is required — it is the receipt', () => {
    expect(validateBooking({ ...good, email: '' }, 3).errors.email).toMatch(/receipt/);
    expect(validateBooking({ ...good, email: 'nope' }, 3).errors.email).toBeTruthy();
    expect(validateBooking({ ...good, email: `${'a'.repeat(200)}@x.in` }, 3).errors.email).toBeTruthy();
  });

  test('name, phone and seats', () => {
    expect(validateBooking({ ...good, name: '' }, 3).errors.name).toBeTruthy();
    expect(validateBooking({ ...good, name: 'x'.repeat(81) }, 3).errors.name).toBeTruthy();
    expect(validateBooking({ ...good, phone: '123' }, 3).errors.phone).toBeTruthy();
    expect(validateBooking({ ...good, seats: 4 }, 3).errors.seats).toBe('Between 1 and 3 places.');
    expect(validateBooking({ ...good, seats: 2 }, 1).errors.seats).toBe('One place is left here.');
    expect(validateBooking({ ...good, seats: '2' }, 3).errors.seats).toBeUndefined();
    expect(validateBooking({ ...good, seats: 0 }, 3).errors.seats).toBeTruthy();
    expect(validateBooking(good, 0).errors.seats).toMatch(/full/);
  });
});

describe('before the migration is live', () => {
  test('PGRST202 — the function is not in the schema cache — means "not open yet"', () => {
    expect(isNotDeployed({ code: 'PGRST202', message: 'Could not find the function public.wellness_menu without parameters in the schema cache' })).toBe(true);
    expect(isNotDeployed({ message: 'Could not find the function public.wellness_slots(p_days, p_from) in the schema cache' })).toBe(true);
    expect(isNotDeployed({ code: 'PGRST202' })).toBe(true);
  });

  test('a real failure is still a failure', () => {
    expect(isNotDeployed({ code: '42501', message: 'permission denied for function wellness_menu' })).toBe(false);
    expect(isNotDeployed({ code: 'PGRST301', message: 'JWT expired' })).toBe(false);
    expect(isNotDeployed(new TypeError('Failed to fetch'))).toBe(false);
    expect(isNotDeployed({ message: '', code: '' })).toBe(false);
    expect(isNotDeployed(null)).toBe(false);
  });
});

describe('refusals and states', () => {
  test('every word the function returns has a sentence', () => {
    for (const w of ['invalid', 'not_found', 'full', 'too_many', 'payment_unavailable', 'server']) {
      expect(bookErrorMessage({ word: w })).toBe(BOOK_ERROR_COPY[w]);
    }
    expect(bookErrorMessage({ error: 'full' })).toBe(BOOK_ERROR_COPY.full);
    expect(bookErrorMessage({ status: 502 })).toBe(BOOK_ERROR_COPY.server);
    expect(bookErrorMessage(new TypeError('Failed to fetch'))).toBe(BOOK_ERROR_FALLBACK);
    expect(bookErrorMessage(null)).toBe(BOOK_ERROR_FALLBACK);
  });

  test('slots are re-read after full or not_found only', () => {
    expect(shouldRefetch({ word: 'full' })).toBe(true);
    expect(shouldRefetch({ word: 'not_found' })).toBe(true);
    expect(shouldRefetch({ word: 'too_many' })).toBe(false);
    expect(shouldRefetch(null)).toBe(false);
  });

  test('order ids', () => {
    const id = `CSW${'0123456789ABCDEF'.repeat(2)}`;
    expect(cleanOrderId(id)).toBe(id);
    expect(cleanOrderId(id.toLowerCase())).toBe(id);
    expect(cleanOrderId(' CSW123 ')).toBeNull();
    expect(cleanOrderId('')).toBeNull();
    expect(cleanOrderId("CSW' OR 1=1")).toBeNull();
  });

  test('states and polling', () => {
    for (const s of BOOKING_STATES) expect(isBookingState(s)).toBe(true);
    expect(isBookingState('held')).toBe(false);
    const t0 = 1_000_000;
    expect(keepPolling('pending', t0, t0 + 5000)).toBe(true);
    expect(keepPolling('pending', t0, t0 + STATUS_POLL_LIMIT_MS)).toBe(false);
    expect(keepPolling('confirmed', t0, t0 + 5000)).toBe(false);
  });

  test('every state has a heading and a body', () => {
    for (const s of [...BOOKING_STATES, 'waiting', 'missing']) {
      const c = stateCopy(s, { name: 'Asha Rao' });
      expect(c.heading).toBeTruthy();
      expect(c.body).toBeTruthy();
    }
    expect(stateCopy('confirmed', { name: 'Asha Rao' }).heading).toBe('You’re booked, Asha.');
    expect(stateCopy('confirmed').heading).toBe('You’re booked.');
    expect(stateCopy('waiting').body).toMatch(/87545 61269/);
  });
});
