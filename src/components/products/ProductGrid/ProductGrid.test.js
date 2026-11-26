import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProductGrid from './ProductGrid';
import { useAuth } from '../../../context/AuthContext';

jest.mock('../../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../services/sanctuaryService', () => ({ listGatherings: () => new Promise(() => {}), imageUrl: () => '' }));

global.IS_REACT_ACT_ENVIRONMENT = true;

const dish = (id, extra = {}) => ({
  id, name: `Dish ${id}`, description: 'Seasonal.', price: 300, category: 'mains', mainCategory: 'food',
  image: `/img/${id}.jpg`, imageDetail: `/img/${id}-lg.jpg`, hasLocalImage: true, ...extra,
});

let root; let el;
beforeEach(() => { el = document.createElement('div'); document.body.appendChild(el); });
afterEach(() => { act(() => root.unmount()); el.remove(); });

function mount(products, auth = { user: null, loading: false, isHost: false }) {
  useAuth.mockReturnValue(auth);
  root = createRoot(el);
  act(() => {
    root.render(<HelmetProvider><MemoryRouter><ProductGrid products={products} onProductClick={() => {}} /></MemoryRouter></HelmetProvider>);
  });
}
const cafe = () => el.querySelector('#cafe');

test('the café stands without its dishes: heading, words and the way to the menu', () => {
  mount([]);
  expect(cafe().querySelector('h2').textContent).toBe('Eat like the earth is watching');
  expect(cafe().querySelector('#signatures')).toBeNull();
  const acts = [...cafe().querySelectorAll('.home-cafe-acts button')].map((b) => b.textContent);
  expect(acts).toEqual(['View the menu', 'Read our story']);
});

test('with the menu loaded, the regulars’ plates sit inside the café section', () => {
  mount([dish('a', { bestseller: true }), dish('b'), dish('c'), dish('d')]);
  const sig = cafe().querySelector('#signatures');
  expect(sig.querySelector('.home-sig-h').textContent).toBe('Plates worth the trip to Auroville Road');
  expect(sig.querySelector('.sig-lead-name').textContent).toBe('Dish a');
  expect(sig.querySelectorAll('.sig-card')).toHaveLength(3);
  expect([...el.querySelectorAll('section h2')].map((h) => h.textContent)).not.toContain('Plates worth the trip to Auroville Road');
});

test('every way to be well that has a page links to it; the ice bath link says what it does', () => {
  mount([]);
  const links = [...el.querySelectorAll('.home-strand-link')].map((b) => b.textContent);
  expect(links).toEqual(['View the menu', 'See the yoga shala', 'Book a session', 'See what’s on']);
});

test('the closing invitation: sign-in for organisers coming back, their events once signed in', () => {
  mount([]);
  const host = el.querySelector('#host');
  expect(host.querySelector('h2').textContent).toBe('Teach, make or gather people? Organise it with us.');
  expect(host.querySelector('.home-host-acts a').textContent).toBe('Already organising with us? Sign in');
  act(() => root.unmount());
  mount([], { user: { id: 'u1' }, loading: false, isHost: true });
  expect(el.querySelector('#host .home-host-acts a').textContent).toBe('Go to your events');
  act(() => root.unmount());
  mount([], { user: null, loading: true, isHost: null });
  expect(el.querySelector('#host .home-host-acts a')).toBeNull();
});

test('a signed-in customer who doesn’t organise is never shown “Go to your events”', () => {
  mount([], { user: { id: 'c1' }, loading: false, isHost: false });
  expect(el.querySelector('#host .home-host-acts a')).toBeNull();
  expect(el.querySelector('#host .home-host-acts .btn').textContent).toBe('Become an organiser');
});
