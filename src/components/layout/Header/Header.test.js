import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../../../context/AuthContext';

jest.mock('../../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../context/CartContext', () => ({ useCart: () => ({ count: 0, setBagOpen: () => {} }) }));

global.IS_REACT_ACT_ENVIRONMENT = true;

let root; let el;
beforeEach(() => { el = document.createElement('div'); document.body.appendChild(el); });
afterEach(() => { act(() => root.unmount()); el.remove(); });

function mount(path, auth) {
  useAuth.mockReturnValue(auth);
  root = createRoot(el);
  act(() => { root.render(<MemoryRouter initialEntries={[path]}><Header /></MemoryRouter>); });
}
const navLinks = () => [...el.querySelectorAll('.nav-right .nav-link')];
const link = (text) => navLinks().find((b) => b.textContent === text);
const menuItem = () => el.querySelector('.mm-organiser');

const SIGNED_OUT = { user: null, loading: false };
const SIGNED_IN = { user: { id: 'u1', email: 'linda@example.com' }, loading: false };

test('a visitor sees no “Your events”; the phone menu offers organiser sign-in', () => {
  mount('/', SIGNED_OUT);
  expect(link('Your events')).toBeUndefined();
  expect(menuItem().textContent).toBe('Organiser sign-in');
});

test('a signed-in organiser gets “Your events”, underlined on their own pages', () => {
  mount('/sanctuary/host/new', SIGNED_IN);
  expect(link('Your events').classList.contains('active')).toBe(true);
  expect(link('Sanctuary').classList.contains('active')).toBe(false);
  expect(menuItem().textContent).toBe('Your events');
});

test('an organiser’s public profile is still the Sanctuary', () => {
  mount('/sanctuary/hosts/82939aa2-4724-488c-b22f-c8103b76c1b2', SIGNED_IN);
  expect(link('Your events').classList.contains('active')).toBe(false);
  expect(link('Sanctuary').classList.contains('active')).toBe(true);
});

test('while the session is still being read, neither label shows', () => {
  mount('/', { user: null, loading: true });
  expect(link('Your events')).toBeUndefined();
  expect(menuItem()).toBeNull();
});
