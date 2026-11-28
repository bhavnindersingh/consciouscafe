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
const go = () => el.querySelector('.sn-org-go')?.textContent ?? null;
const invite = () => [...el.querySelectorAll('.sn-band-acts button')].map((b) => b.textContent);

test('signed out: one door for organisers, new or coming back — and the band invites, with a way back in', async () => {
  await mount({ user: null, loading: false, isHost: false });
  expect(toolbar()).toBe('For organisers');
  expect(invite()).toEqual(['Become an organiser']);
  expect(band()).toBe('Already organising with us? Sign in');
});

test('an organiser: their events — and the band sends them there, not to become one', async () => {
  await mount({ user: { id: 'h1' }, loading: false, isHost: true, hostRow: { user_id: 'h1', status: 'approved' } });
  expect(toolbar()).toBe('Your events');
  expect(go()).toBe('Go to your events');
  expect(invite()).toEqual([]);
  expect(band()).toBeNull();
});

test('someone waiting on their introduction: their request, in their words', async () => {
  await mount({ user: { id: 'h1' }, loading: false, isHost: true, hostRow: { user_id: 'h1', status: 'requested' } });
  expect(toolbar()).toBe('Your organiser request');
  expect(go()).toBe('Go to your organiser request');
});

test('a signed-in customer who doesn’t organise is invited, never shown “Your events”', async () => {
  await mount({ user: { id: 'c1' }, loading: false, isHost: false });
  expect(toolbar()).toBe('For organisers');
  expect(invite()).toEqual(['Become an organiser']);
  expect(band()).toBeNull();
  expect(el.textContent).not.toContain('Your events');
});

test('while it isn’t known yet whether they organise, nothing shows', async () => {
  await mount({ user: { id: 'c1' }, loading: false, isHost: null });
  expect(toolbar()).toBeNull();
  expect(band()).toBeNull();
  expect(go()).toBeNull();
  expect(invite()).toEqual([]);
});
