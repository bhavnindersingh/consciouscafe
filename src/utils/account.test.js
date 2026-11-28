import {
  makeOrderRef, ORDER_REF_PATTERN, ORDER_REF_ALPHABET, buildOrderPayload, firstName, accountPrefill,
  timeline, eventState, sessionState, itemsSummary, reorderPlan, rupees, listAnd, phoneDigitsOk, accountMenu, organiserLabel,
} from './account';

test('the order ref: W- and six Crockford letters, never I, L, O or U', () => {
  expect(ORDER_REF_ALPHABET).toHaveLength(32);
  expect(ORDER_REF_ALPHABET).not.toMatch(/[ILOU]/);
  expect(makeOrderRef(new Uint8Array([0, 1, 31, 32, 255, 100]))).toBe('W-01Z0Z4');
  for (let i = 0; i < 200; i += 1) expect(makeOrderRef()).toMatch(ORDER_REF_PATTERN);
});

test('what checkout saves: trimmed details, the bag as lines, the totals it showed', () => {
  const cart = [{ id: 7, name: 'Millet bowl', price: 320, quantity: 2, image: 'x.jpg' }, { id: 'r9', name: 'Ragi cookie', price: 90.5, quantity: 1 }];
  const p = buildOrderPayload('W-ABC123', cart,
    { name: ' Asha ', phone: ' 98400 00000 ', email: 'a@b.in ', address: ' 1 Road ', distance: '2.5', notes: '  ' },
    { subtotal: 730.5, packaging: 20, gst: 37.53, total: 788.0300000001, packagingKnown: true });
  expect(p).toEqual({
    p_ref: 'W-ABC123', p_name: 'Asha', p_phone: '98400 00000', p_email: 'a@b.in', p_address: '1 Road',
    p_distance_km: 2.5, p_notes: null,
    p_items: [{ id: '7', name: 'Millet bowl', qty: 2, price: 320 }, { id: 'r9', name: 'Ragi cookie', qty: 1, price: 90.5 }],
    p_subtotal: 730.5, p_packaging: 20, p_gst: 37.53, p_total: 788.03, p_packaging_known: true,
  });
});

test('names come from the account only', () => {
  expect(firstName({ user_metadata: { full_name: 'Asha Raman' } })).toBe('Asha');
  expect(firstName({ user_metadata: {} })).toBeNull();
  expect(firstName(null)).toBeNull();
  expect(accountPrefill({ email: 'a@b.in', user_metadata: { full_name: 'Asha Raman' } })).toEqual({ name: 'Asha Raman', email: 'a@b.in' });
  expect(accountPrefill({ email: 'a@b.in' })).toEqual({ name: '', email: 'a@b.in' });
});

test('the timeline: still to come soonest first (in progress counts), past latest first', () => {
  const now = Date.parse('2026-12-01T06:00:00Z');
  const t = timeline({
    events: [
      { id: 'past', starts_at: '2026-11-20T04:00:00Z', ends_at: '2026-11-20T05:00:00Z' },
      { id: 'later', starts_at: '2026-12-10T04:00:00Z', ends_at: '2026-12-10T05:00:00Z' },
      { id: 'now', starts_at: '2026-12-01T05:00:00Z', ends_at: '2026-12-01T07:00:00Z' },
    ],
    sessions: [
      { id: 'soon', slot_start: '2026-12-02T04:00:00Z', slot_end: '2026-12-02T04:30:00Z' },
      { id: 'old', slot_start: '2026-11-25T04:00:00Z', slot_end: '2026-11-25T04:30:00Z' },
    ],
  }, now);
  expect(t.upcoming.map((x) => x.key)).toEqual(['e-now', 's-soon', 'e-later']);
  expect(t.past.map((x) => x.key)).toEqual(['s-old', 'e-past']);
  expect(timeline(null, now)).toEqual({ upcoming: [], past: [] });
});

test('states say what changed, and nothing when all is well', () => {
  expect(eventState({ status: 'confirmed', event_cancelled: false })).toBeNull();
  expect(eventState({ status: 'cancelled', event_cancelled: false })).toBe('Cancelled');
  expect(eventState({ status: 'confirmed', event_cancelled: true })).toBe('Event cancelled');
  expect(sessionState({ status: 'confirmed' })).toBeNull();
  expect(sessionState({ status: 'cancelled', refund_state: 'completed' })).toBe('Cancelled · refunded');
  expect(sessionState({ status: 'cancelled', refund_state: 'pending' })).toBe('Cancelled · refund on its way');
  expect(sessionState({ status: 'cancelled', refund_state: null })).toBe('Cancelled');
});

test('an order in a line', () => {
  expect(itemsSummary([{ name: 'Dosa', qty: 1 }])).toBe('Dosa');
  expect(itemsSummary([{ name: 'A', qty: 2 }, { name: 'B', qty: 1 }, { name: 'C', qty: 1 }, { name: 'D', qty: 1 }, { name: 'E', qty: 3 }]))
    .toBe('2 × A, B, C and 2 more');
});

test('order again: today’s menu and prices; the rest named', () => {
  const products = [{ id: 7, name: 'Millet bowl', price: 340 }, { id: 'r9', name: 'Ragi cookie', price: 95 }];
  const plan = reorderPlan([{ id: '7', name: 'Millet bowl', qty: 2, price: 320 }, { id: 'gone1', name: 'Summer salad', qty: 1, price: 280 }], products);
  expect(plan.add).toEqual([{ id: 7, name: 'Millet bowl', price: 340, quantity: 2 }]);
  expect(plan.gone).toEqual(['Summer salad']);
});

test('money and lists read as people say them', () => {
  expect(rupees(590)).toBe('₹590');
  expect(rupees(1478.4)).toBe('₹1,478.40');
  expect(listAnd(['Dosa'])).toBe('Dosa');
  expect(listAnd(['Kombucha', 'Dosa'])).toBe('Kombucha and Dosa');
  expect(listAnd(['Ragi cookie', 'Kombucha', 'Dosa'])).toBe('Ragi cookie, Kombucha and Dosa');
});

test('order again brings a variation back as that variation, if the dish still offers it', () => {
  const products = [{ id: 12, name: 'Cappuccino', price: 180, variations: [{ id: 'v-oat', name: 'Oat Milk', price: 220 }, { id: null, name: 'Coconut Milk', price: 230 }] }];
  const plan = reorderPlan([
    { id: '12::v-oat', name: 'Cappuccino · Oat Milk', qty: 2, price: 210 },
    { id: '12::coconut-milk', name: 'Cappuccino · Coconut Milk', qty: 1, price: 230 },
    { id: '12::v-gone', name: 'Cappuccino · Almond Milk', qty: 1, price: 240 },
  ], products);
  expect(plan.add.map((x) => [x.id, x.name, x.price, x.quantity])).toEqual([
    ['12::v-oat', 'Cappuccino · Oat Milk', 220, 2],
    ['12::coconut-milk', 'Cappuccino · Coconut Milk', 230, 1],
  ]);
  expect(plan.gone).toEqual(['Cappuccino · Almond Milk']);
});

test('a phone the café can call back on: 10 to 15 digits', () => {
  expect(phoneDigitsOk('98400 00000')).toBe(true);
  expect(phoneDigitsOk('+91 98400-00000')).toBe(true);
  expect(phoneDigitsOk('984000000')).toBe(false);
  expect(phoneDigitsOk('')).toBe(false);
});

test('what checkout saves always fits the record: tiny distances and long names', () => {
  const p = buildOrderPayload('W-ABC123', [{ id: 1, name: 'x', price: 1, quantity: 1 }],
    { name: 'A'.repeat(90), phone: '9840000000', email: 'a@b.in', address: 'x', distance: '0.04' },
    { subtotal: 1, packaging: 0, gst: 0, total: 1, packagingKnown: true });
  expect(p.p_distance_km).toBe(0.1);
  expect(p.p_name).toHaveLength(80);
  expect(accountPrefill({ user_metadata: { full_name: 'B'.repeat(100) } }).name).toHaveLength(80);
});

test('the account menu: everyone’s bookings; an organiser’s way in, worded by where they stand', () => {
  const user = { id: 'u1', email: 'asha@example.com', user_metadata: {} };
  // an emailed-code sign-in has no name: the email stands in, and gives the initial
  expect(accountMenu(user, null)).toEqual({
    name: '', email: 'asha@example.com', initial: 'A', items: [{ label: 'Your bookings and orders', to: '/account' }],
  });
  const row = (status) => ({ user_id: 'u1', status, display_name: 'Asha Rao' });
  expect(accountMenu(user, row('approved')).items.map((i) => i.to)).toEqual(['/account', '/sanctuary/host', '/sanctuary/hosts/u1']);
  expect(accountMenu(user, row('requested')).items[1]).toEqual({ label: 'Your organiser request', to: '/sanctuary/host' });
  expect(accountMenu(user, row('paused')).items[1]).toEqual({ label: 'Your organiser account', to: '/sanctuary/host' });
  expect(accountMenu(user, row('declined')).items).toHaveLength(2);
  // the organiser's own name wins over Google's
  expect(accountMenu({ ...user, user_metadata: { full_name: 'asha r' } }, row('approved')).name).toBe('Asha Rao');
  expect(accountMenu({ ...user, user_metadata: { full_name: 'zoë m' } }, null).initial).toBe('Z');
});

test('the organiser link says where they stand; nothing for someone who doesn’t organise', () => {
  expect(organiserLabel(null)).toBeNull();
  expect(organiserLabel(undefined)).toBeNull();
  expect(organiserLabel({ status: 'approved' })).toBe('Your events');
  expect(organiserLabel({ status: 'requested' })).toBe('Your organiser request');
  expect(organiserLabel({ status: 'paused' })).toBe('Your organiser account');
  expect(organiserLabel({ status: 'declined' })).toBe('Your organiser account');
});
