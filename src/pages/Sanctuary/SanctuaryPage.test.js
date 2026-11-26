import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import SanctuaryPage from './SanctuaryPage';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/sanctuaryService', () => ({
  listGatherings: () => Promise.resolve([]),
  imageUrl: () => '',
  videoFileUrl: () => '',
}));

global.IS_REACT_ACT_ENVIRONMENT = true;
Element.prototype.scrollIntoView = jest.fn();
window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }));

let root; let el;
beforeEach(() => { el = document.createElement('div'); document.body.appendChild(el); });
afterEach(() => { act(() => root.unmount()); el.remove(); });

async function mount(auth) {
  useAuth.mockReturnValue(auth);
  root = createRoot(el);
  await act(async () => {
    root.render(<HelmetProvider><MemoryRouter initialEntries={['/sanctuary']}><SanctuaryPage /></MemoryRouter></HelmetProvider>);
  });
}
const toolbar = () => el.querySelector('.sn-org-link')?.textContent ?? null;
const band = () => el.querySelector('.sn-org-again')?.textContent ?? null;

test('signed out: the organiser sign-in, in the toolbar and the band', async () => {
  await mount({ user: null, loading: false, isHost: false });
  expect(toolbar()).toBe('Organiser sign-in');
  expect(band()).toBe('Already organising with us? Sign in');
});

test('an organiser: their events', async () => {
  await mount({ user: { id: 'h1' }, loading: false, isHost: true });
  expect(toolbar()).toBe('Your events');
  expect(band()).toBe('Go to your events');
});

test('a signed-in customer who doesn’t organise is invited, never shown “Your events”', async () => {
  await mount({ user: { id: 'c1' }, loading: false, isHost: false });
  expect(toolbar()).toBe('Organise with us');
  expect(band()).toBeNull();
  expect(el.textContent).not.toContain('Your events');
});

test('while it isn’t known yet whether they organise, nothing shows', async () => {
  await mount({ user: { id: 'c1' }, loading: false, isHost: null });
  expect(toolbar()).toBeNull();
  expect(band()).toBeNull();
});
