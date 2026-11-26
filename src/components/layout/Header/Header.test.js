import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../../../context/AuthContext';

jest.mock('../../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../context/CartContext', () => ({ useCart: () => ({ count: 0, setBagOpen: () => {} }) }));

global.IS_REACT_ACT_ENVIRONMENT = true;

let root; let el;
beforeEach(() => { el = document.createElement('div'); document.body.appendChild(el); });
afterEach(() => { act(() => root.unmount()); el.remove(); });

let here = null;
const Probe = () => { here = useLocation().pathname; return null; };
function mount(path, auth) {
  useAuth.mockReturnValue(auth);
  root = createRoot(el);
  act(() => { root.render(<MemoryRouter initialEntries={[path]}><Header /><Probe /></MemoryRouter>); });
}
const texts = (sel) => [...el.querySelectorAll(sel)].map((b) => b.textContent);
const tab = (text) => [...el.querySelectorAll('.nav .nav-link')].find((b) => b.textContent === text);
const acct = () => el.querySelector('.nav-right .nav-acct');
const menuItem = () => el.querySelector('.mm-account');

const SIGNED_OUT = { user: null, loading: false };
const SIGNED_IN = { user: { id: 'u1', email: 'linda@example.com' }, loading: false };

test('what’s here on the left, about and finding us on the right; the wordmark is the way home', () => {
  mount('/', SIGNED_OUT);
  expect(texts('.nav-links .nav-link')).toEqual(['Menu', 'Sanctuary', 'Ice bath & sauna']);
  expect(texts('.nav-right .nav-link')).toEqual(['Story', 'Visit']);
  expect(tab('Home')).toBeUndefined();
  expect(el.querySelector('.brand').getAttribute('aria-label')).toBe('Conscious Café Sanctuary, home');
  // after the bag, the organisers' icon
  expect(el.querySelector('.nav-right .bag').nextElementSibling).toBe(acct());
  // the phone menu keeps the same order, with Home first
  expect(texts('.mm-label')).toEqual(['Home', 'Menu', 'Sanctuary', 'Ice bath & sauna', 'Story', 'Visit']);
});

test('signed out, the icon is “Sign in” and leads to Your account — in the header and the phone menu', () => {
  mount('/', SIGNED_OUT);
  expect(acct().getAttribute('aria-label')).toBe('Sign in');
  expect(acct().classList.contains('is-in')).toBe(false);
  expect(menuItem().textContent).toBe('Sign in');
  act(() => { acct().click(); });
  expect(here).toBe('/account');
});

test('signed in — anyone, not only organisers — it is “Your account”, marked, underlined there', () => {
  mount('/account', SIGNED_IN);
  expect(acct().getAttribute('aria-label')).toBe('Your account');
  expect(acct().classList.contains('is-in')).toBe(true);
  expect(acct().classList.contains('active')).toBe(true);
  expect(menuItem().textContent).toBe('Your account');
  act(() => { menuItem().click(); });
  expect(here).toBe('/account');
});

test('an organiser’s own pages underline the account icon, not the Sanctuary tab', () => {
  mount('/sanctuary/host/new', SIGNED_IN);
  expect(acct().classList.contains('active')).toBe(true);
  expect(tab('Sanctuary').classList.contains('active')).toBe(false);
});

test('an organiser’s public profile is still the Sanctuary', () => {
  mount('/sanctuary/hosts/82939aa2-4724-488c-b22f-c8103b76c1b2', SIGNED_IN);
  expect(acct().classList.contains('active')).toBe(false);
  expect(tab('Sanctuary').classList.contains('active')).toBe(true);
});

test('while the session is still being read, the icon holds its place unmarked; the menu item waits', () => {
  mount('/', { user: null, loading: true });
  expect(acct().getAttribute('aria-label')).toBe('Sign in');
  expect(acct().classList.contains('is-in')).toBe(false);
  expect(menuItem()).toBeNull();
});
