import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AccountPage from './AccountPage';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getMyAccount } from '../../services/accountService';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../context/CartContext', () => ({ useCart: jest.fn() }));
jest.mock('../../services/accountService', () => ({ getMyAccount: jest.fn() }));

global.IS_REACT_ACT_ENVIRONMENT = true;

const day = 864e5;
const at = (offsetDays, hours = 1) => {
  const s = new Date(Date.now() + offsetDays * day);
  return { start: s.toISOString(), end: new Date(s.getTime() + hours * 36e5).toISOString() };
};

const soon = at(3);
const later = at(10);
const before = at(-12);
const ACCOUNT = {
  email: 'asha@example.com',
  is_host: false,
  events: [
    { id: 'r1', offering_id: 'o1', title: 'Breath and stillness', kind: 'class', starts_at: later.start, ends_at: later.end, location: 'Conscious Sanctuary, Auroville Road', at_sanctuary: true, seats: 2, status: 'confirmed', event_cancelled: false },
    { id: 'r2', offering_id: 'o2', title: 'Clay evening', kind: 'workshop', starts_at: before.start, ends_at: before.end, location: 'Riverside Farm', at_sanctuary: false, seats: 1, status: 'confirmed', event_cancelled: false },
  ],
  sessions: [
    { id: 's1', service: 'ice_bath', service_name: 'Ice bath', slot_start: soon.start, slot_end: soon.end, seats: 1, status: 'confirmed', amount_paise: 59000, refund_state: null },
  ],
  orders: [
    { ref: 'W-7K3Q9P', created_at: before.start, items: [{ id: '7', name: 'Millet bowl', qty: 2, price: 320 }, { id: 'gone', name: 'Summer salad', qty: 1, price: 280 }], total: 920, packaging_known: true },
  ],
};
const EMPTY = { email: 'asha@example.com', is_host: false, events: [], sessions: [], orders: [] };

let root; let el; let cart;
beforeEach(() => {
  el = document.createElement('div'); document.body.appendChild(el);
  cart = { addToCart: jest.fn(), setBagOpen: jest.fn() };
  useCart.mockReturnValue(cart);
  getMyAccount.mockReset();
});
afterEach(() => { act(() => root.unmount()); el.remove(); });

async function mount(auth, { products = [] } = {}) {
  useAuth.mockReturnValue({ signOut: jest.fn(), signInWithGoogle: jest.fn(), ...auth });
  root = createRoot(el);
  await act(async () => {
    root.render(<HelmetProvider><MemoryRouter><AccountPage products={products} /></MemoryRouter></HelmetProvider>);
  });
}
const ASHA = { user: { id: 'u1', email: 'asha@example.com', user_metadata: { full_name: 'Asha Raman' } }, loading: false };
const text = (sel) => [...el.querySelectorAll(sel)].map((n) => n.textContent);

test('signed out: what’s inside, and the sign-in card — no call for data', async () => {
  await mount({ user: null, loading: false });
  expect(el.querySelector('h1').textContent).toBe('Your bookings and orders');
  expect(el.querySelector('.sn-signin-card h2').textContent).toBe('Sign in');
  expect(el.querySelector('.sn-google').textContent).toContain('Sign in with Google');
  expect(getMyAccount).not.toHaveBeenCalled();
});

test('signed in: greeting, then coming up (soonest first), food orders, then past', async () => {
  getMyAccount.mockResolvedValue(ACCOUNT);
  await mount(ASHA);
  expect(el.querySelector('h1').textContent).toBe('Hello, Asha');
  expect(el.querySelector('.ac-who').textContent).toContain('asha@example.com');
  expect(text('.ac-h')).toEqual(['Coming up', 'Food orders', 'Past']);
  const [up, orders, past] = [...el.querySelectorAll('.ac-sec')];
  expect([...up.querySelectorAll('.sn-row-title')].map((t) => t.textContent)).toEqual(['Ice bath', 'Breath and stillness']);
  expect(up.querySelector('a.sn-row').getAttribute('href')).toBe('/sanctuary/o1');
  expect(up.textContent).toContain('2 places');
  expect(up.textContent).toContain('₹590');
  expect(orders.textContent).toContain('W-7K3Q9P');
  expect(orders.textContent).toContain('Sent by WhatsApp');
  expect(orders.querySelector('.sn-row-title').textContent).toBe('2 × Millet bowl, Summer salad');
  expect(past.querySelector('.sn-row-title').textContent).toBe('Clay evening');
  expect(past.textContent).toContain('Riverside Farm');
  // sessions exist, so no "once online booking opens" note
  expect(el.textContent).not.toContain('once online booking opens');
});

test('no name from the account: no guessed greeting', async () => {
  getMyAccount.mockResolvedValue(EMPTY);
  await mount({ user: { id: 'u1', email: 'asha@example.com', user_metadata: {} }, loading: false });
  expect(el.querySelector('h1').textContent).toBe('Your account');
});

test('nothing yet: says which email it looks for, where to start, and when sessions will show', async () => {
  getMyAccount.mockResolvedValue(EMPTY);
  await mount(ASHA);
  expect(el.querySelector('.sn-empty-h').textContent).toBe('Nothing here yet.');
  expect(el.querySelector('.ac-empty').textContent).toContain('asha@example.com');
  expect(text('.ac-empty .ac-acts a')).toEqual(['See what’s on', 'See the menu']);
  expect(el.textContent).toContain('Ice bath & sauna sessions appear here once online booking opens');
});

test('a failed load says so, and Try again asks again', async () => {
  getMyAccount.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(EMPTY);
  await mount(ASHA);
  expect(el.querySelector('.sn-empty-h').textContent).toBe('We couldn’t load your bookings.');
  await act(async () => { el.querySelector('.sn-empty .btn').click(); });
  expect(getMyAccount).toHaveBeenCalledTimes(2);
  expect(el.querySelector('.sn-empty-h').textContent).toBe('Nothing here yet.');
});

test('organisers get their events; everyone else a quiet invitation', async () => {
  getMyAccount.mockResolvedValue({ ...EMPTY, is_host: true });
  await mount(ASHA);
  const org = el.querySelector('.ac-org a');
  expect(org.textContent).toBe('Your events');
  expect(org.getAttribute('href')).toBe('/sanctuary/host');
  act(() => root.unmount());
  getMyAccount.mockResolvedValue(EMPTY);
  await mount(ASHA);
  expect(el.querySelector('.ac-org')).toBeNull();
  expect(el.querySelector('.ac-org-quiet a').textContent).toBe('Organise with us');
});

test('order again: what’s still on the menu goes in the bag at today’s price; the rest is named', async () => {
  getMyAccount.mockResolvedValue(ACCOUNT);
  const products = [{ id: 7, name: 'Millet bowl', price: 340 }];
  await mount(ASHA, { products });
  const button = [...el.querySelectorAll('button')].find((b) => b.textContent === 'Order again');
  expect(button.disabled).toBe(false);
  act(() => { button.click(); });
  expect(cart.addToCart).toHaveBeenCalledWith({ id: 7, name: 'Millet bowl', price: 340, quantity: 2 });
  expect(cart.setBagOpen).toHaveBeenCalledWith(true);
  expect(el.querySelector('.ac-note').textContent).toBe('Added to your bag at today’s prices. Summer salad isn’t on today’s menu.');
});

test('order again waits for the menu', async () => {
  getMyAccount.mockResolvedValue(ACCOUNT);
  await mount(ASHA, { products: [] });
  const button = [...el.querySelectorAll('button')].find((b) => b.textContent === 'Order again');
  expect(button.disabled).toBe(true);
});
