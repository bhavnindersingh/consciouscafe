import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../../../context/AuthContext';

jest.mock('../../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../context/CartContext', () => ({ useCart: () => ({ count: 0, setBagOpen: () => {} }) }));
jest.mock('../../../services/sanctuaryService', () => ({ imageUrl: (p) => (p ? `https://img.test/${p}` : null) }));

global.IS_REACT_ACT_ENVIRONMENT = true;

let root; let el;
beforeEach(() => { el = document.createElement('div'); document.body.appendChild(el); });
afterEach(() => { act(() => root.unmount()); el.remove(); jest.useRealTimers(); });

let here = null;
let go = null;
const Probe = () => { here = useLocation().pathname; go = useNavigate(); return null; };
function mount(path, auth) {
  useAuth.mockReturnValue({ hostRow: null, signOut: jest.fn(async () => ({ error: null })), ...auth });
  root = createRoot(el);
  act(() => { root.render(<MemoryRouter initialEntries={[path]}><Header /><Probe /></MemoryRouter>); });
  return useAuth.mock.results[useAuth.mock.results.length - 1].value;
}
const texts = (sel) => [...el.querySelectorAll(sel)].map((b) => b.textContent);
const tab = (text) => [...el.querySelectorAll('.nav .nav-link')].find((b) => b.textContent === text);
const acct = () => el.querySelector('.nav-right .nav-acct');
const menu = () => el.querySelector('[role="menu"]');
const items = () => texts('[role="menuitem"]');
const phoneAccount = () => texts('.mm-foot .mm-account');
const key = (target, k) => act(() => { target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })); });

const SIGNED_OUT = { user: null, loading: false };
const LINDA = { id: 'u1', email: 'linda@example.com', user_metadata: { full_name: 'Linda Rao' } };
const SIGNED_IN = { user: LINDA, loading: false, isHost: false };
const approved = { user_id: 'u1', status: 'approved', display_name: 'Linda R.', avatar_path: null };

test('what’s here on the left, about and finding us on the right; the wordmark is the way home', () => {
  mount('/', SIGNED_OUT);
  expect(texts('.nav-links .nav-link')).toEqual(['Menu', 'Sanctuary', 'Ice bath & sauna']);
  expect(texts('.nav-right .nav-link')).toEqual(['Story', 'Visit']);
  expect(tab('Home')).toBeUndefined();
  expect(el.querySelector('.brand').getAttribute('aria-label')).toBe('Conscious Café Sanctuary, home');
  // after the bag, the account icon
  expect(el.querySelector('.nav-right .bag').nextElementSibling.contains(acct())).toBe(true);
  // the phone menu keeps the same order, with Home first
  expect(texts('.mm-label')).toEqual(['Home', 'Menu', 'Sanctuary', 'Ice bath & sauna', 'Story', 'Visit']);
});

test('signed out, the icon is “Sign in” and goes straight to Your account — no menu', () => {
  mount('/', SIGNED_OUT);
  expect(acct().getAttribute('aria-label')).toBe('Sign in');
  expect(acct().hasAttribute('aria-haspopup')).toBe(false);
  expect(acct().classList.contains('is-in')).toBe(false);
  expect(phoneAccount()).toEqual(['Sign in']);
  expect(el.querySelector('.mm-signout')).toBeNull();
  act(() => { acct().click(); });
  expect(here).toBe('/account');
  expect(menu()).toBeNull();
});

test('signed in, the icon is you — your initial — and opens a menu: who you are, your bookings, Sign out', () => {
  mount('/', SIGNED_IN);
  expect(acct().getAttribute('aria-label')).toBe('Your account');
  expect(acct().getAttribute('aria-haspopup')).toBe('menu');
  expect(acct().getAttribute('aria-expanded')).toBe('false');
  expect(acct().textContent).toBe('L');
  act(() => { acct().click(); });
  expect(acct().getAttribute('aria-expanded')).toBe('true');
  expect(el.querySelector('.nav-menu-name').textContent).toBe('Linda Rao');
  expect(el.querySelector('.nav-menu-email').textContent).toBe('linda@example.com');
  expect(items()).toEqual(['Your bookings and orders', 'Sign out']);
  // focus goes into the menu
  expect(document.activeElement.textContent).toBe('Your bookings and orders');
  expect(here).toBe('/');
});

test('an approved organiser also gets their events and profile; their own name and photo', () => {
  mount('/', { ...SIGNED_IN, isHost: true, hostRow: { ...approved, avatar_path: 'u1/me.jpg' } });
  expect(acct().querySelector('img').getAttribute('src')).toBe('https://img.test/u1/me.jpg');
  act(() => { acct().click(); });
  expect(el.querySelector('.nav-menu-name').textContent).toBe('Linda R.');
  expect(items()).toEqual(['Your bookings and orders', 'Your events', 'Your profile', 'Sign out']);
  expect(el.querySelector('a[role="menuitem"][href="/sanctuary/hosts/u1"]')).not.toBeNull();
  // and the phone menu leads to the events beside the account
  expect(phoneAccount()).toEqual(['Your account', 'Your events']);
});

test('someone waiting on their introduction sees their request, not “Your events”', () => {
  mount('/', { ...SIGNED_IN, isHost: true, hostRow: { ...approved, status: 'requested' } });
  act(() => { acct().click(); });
  expect(items()).toEqual(['Your bookings and orders', 'Your organiser request', 'Sign out']);
});

test('no organiser items while it isn’t known yet whether they organise', () => {
  mount('/', { ...SIGNED_IN, isHost: null, hostRow: null });
  act(() => { acct().click(); });
  expect(items()).toEqual(['Your bookings and orders', 'Sign out']);
});

test('arrows move through the menu; Escape closes it back onto the icon', () => {
  mount('/', { ...SIGNED_IN, isHost: true, hostRow: approved });
  act(() => { acct().click(); });
  key(document.activeElement, 'ArrowDown');
  expect(document.activeElement.textContent).toBe('Your events');
  key(document.activeElement, 'End');
  expect(document.activeElement.textContent).toBe('Sign out');
  key(document.activeElement, 'ArrowDown');
  expect(document.activeElement.textContent).toBe('Your bookings and orders');
  key(document.activeElement, 'Escape');
  expect(menu()).toBeNull();
  expect(document.activeElement).toBe(acct());
});

test('a tap elsewhere, or going to another page, closes the menu', () => {
  mount('/', SIGNED_IN);
  act(() => { acct().click(); });
  act(() => { document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })); });
  expect(menu()).toBeNull();
  act(() => { acct().click(); });
  act(() => { go('/menu'); });
  expect(menu()).toBeNull();
});

test('Sign out signs out, closes the menu, and says so under the header', async () => {
  jest.useFakeTimers();
  const auth = mount('/', SIGNED_IN);
  act(() => { acct().click(); });
  const out = [...el.querySelectorAll('[role="menuitem"]')].find((b) => b.textContent === 'Sign out');
  await act(async () => { out.click(); });
  expect(auth.signOut).toHaveBeenCalledTimes(1);
  expect(menu()).toBeNull();
  expect(el.querySelector('.nav-note').textContent).toBe('You’re signed out.');
  expect(el.querySelector('.nav-note').getAttribute('role')).toBe('status');
  act(() => { jest.advanceTimersByTime(4000); });
  expect(el.querySelector('.nav-note').textContent).toBe('');
});

test('when signing out fails, it says so instead of pretending', async () => {
  const auth = mount('/', { ...SIGNED_IN, signOut: jest.fn(async () => ({ error: new Error('offline') })) });
  act(() => { acct().click(); });
  const out = [...el.querySelectorAll('[role="menuitem"]')].find((b) => b.textContent === 'Sign out');
  await act(async () => { out.click(); });
  expect(auth.signOut).toHaveBeenCalled();
  expect(el.querySelector('.nav-note').textContent).toMatch(/couldn’t sign you out/);
});

test('on a phone, the ☰ menu says who’s signed in and signs out from there', async () => {
  const auth = mount('/', SIGNED_IN);
  expect(phoneAccount()).toEqual(['Your account']);
  expect(el.querySelector('.mm-acct-who').textContent).toContain('linda@example.com');
  await act(async () => { el.querySelector('.mm-signout').click(); });
  expect(auth.signOut).toHaveBeenCalledTimes(1);
  expect(el.querySelector('.nav-note').textContent).toBe('You’re signed out.');
});

test('your account and an organiser’s own pages underline the account icon, not the Sanctuary tab', () => {
  mount('/sanctuary/host/new', SIGNED_IN);
  expect(acct().classList.contains('active')).toBe(true);
  expect(tab('Sanctuary').classList.contains('active')).toBe(false);
});

test('an organiser’s public profile is still the Sanctuary', () => {
  mount('/sanctuary/hosts/82939aa2-4724-488c-b22f-c8103b76c1b2', SIGNED_IN);
  expect(acct().classList.contains('active')).toBe(false);
  expect(tab('Sanctuary').classList.contains('active')).toBe(true);
});

test('while the session is still being read, the icon holds its place as “Sign in”; the phone menu waits', () => {
  mount('/', { user: null, loading: true });
  expect(acct().getAttribute('aria-label')).toBe('Sign in');
  expect(acct().classList.contains('is-in')).toBe(false);
  expect(phoneAccount()).toEqual([]);
});
