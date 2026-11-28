import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HostProfilePage from './HostProfilePage';
import { getHost, listHostGatherings, getMyHost, listMyGatherings } from '../../services/sanctuaryService';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../services/sanctuaryService', () => ({
  getHost: jest.fn(),
  listHostGatherings: jest.fn(),
  getMyHost: jest.fn(),
  listMyGatherings: jest.fn(),
  imageUrl: (p) => (p ? `https://img.test/${p}` : null),
  videoFileUrl: () => '',
}));

// signed out unless a test says otherwise
jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn(() => ({ user: null, loading: false })) }));

global.IS_REACT_ACT_ENVIRONMENT = true;

const DAY = 86400e3;
const iso = (ms) => new Date(ms).toISOString();
const soon = Date.now() + 3 * DAY;
const HOST = '82939aa2-4724-488c-b22f-c8103b76c1b2';
const EVENT = '816b9ae8-ac28-49ed-bd69-75e5154e227e';

const thin = {
  id: HOST, display_name: 'Nandhini Ravi', bio: null, link: null, tagline: null,
  avatar_path: null, cover_path: null, gallery_paths: [], place_name: null, place_address: null,
};
const full = { ...thin, bio: 'Potter and teacher.', avatar_path: `${HOST}/a.jpg`, cover_path: `${HOST}/c.jpg` };
const event = {
  id: EVENT, kind: 'event', title: 'Seasons Craft Market', starts_at: iso(soon), ends_at: iso(soon + 3 * 3600e3),
  location: 'Conscious Sanctuary, Auroville Road', price_inr: 0, capacity: null, seats_left: null,
  host_id: HOST, host_name: 'Nandhini Ravi', series_id: null, image_path: null,
};
const mineRow = (status, id = status) => ({ ...event, id, status });
const signedInAs = (id) => useAuth.mockImplementation(() => ({ user: { id, email: 'n@example.com' }, loading: false }));

let root; let el;
beforeEach(() => {
  el = document.createElement('div'); document.body.appendChild(el);
  [getHost, listHostGatherings, getMyHost, listMyGatherings].forEach((f) => f.mockReset());
  listHostGatherings.mockResolvedValue([]);
  useAuth.mockImplementation(() => ({ user: null, loading: false }));
});
afterEach(() => { act(() => root.unmount()); el.remove(); });

async function open(host, { state, rows } = {}) {
  getHost.mockResolvedValue(host);
  if (rows) listHostGatherings.mockResolvedValue(rows);
  root = createRoot(el);
  await act(async () => {
    root.render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[{ pathname: `/sanctuary/hosts/${HOST}`, state }]}>
          <Routes><Route path="/sanctuary/hosts/:hostId" element={<HostProfilePage />} /></Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );
  });
  await act(async () => {}); // the organiser's own row and events load after the page
}
const $ = (s) => el.querySelector(s);
const $$ = (s) => [...el.querySelectorAll(s)];
const text = (s) => $(s)?.textContent.trim();
const href = (s) => $(s)?.getAttribute('href');

describe('a visitor', () => {
  test('from an event, back goes to that event — not to the calendar', async () => {
    await open(full, { state: { from: { path: `/sanctuary/${EVENT}`, label: 'Seasons Craft Market' } }, rows: [event] });
    expect(text('.sn-back')).toBe('← Seasons Craft Market');
    expect(href('.sn-back')).toBe(`/sanctuary/${EVENT}`);
    expect($('.sn-org-owner')).toBeNull();
    expect(getMyHost).not.toHaveBeenCalled();
    expect(listMyGatherings).not.toHaveBeenCalled();
    expect(text('.sn-row-title')).toBe('Seasons Craft Market');
  });

  test('straight to the page, back goes to all events; only a path on this site is taken from the link', async () => {
    await open(full, { state: { from: { path: 'https://elsewhere.test/', label: 'Elsewhere' } } });
    expect(text('.sn-back')).toBe('← All events');
    expect(href('.sn-back')).toBe('/sanctuary');
  });

  test('no cover photo, no empty band; a cover photo is drawn across the top', async () => {
    await open(thin);
    expect($('main').classList.contains('no-cover')).toBe(true);
    expect($('.sn-org-cover')).toBeNull();
    act(() => root.unmount());
    await open(full);
    expect($('main').classList.contains('no-cover')).toBe(false);
    expect($('.sn-org-cover img').getAttribute('src')).toBe(`https://img.test/${HOST}/c.jpg`);
  });

  test('nothing coming up: says so, and points at the rest of the calendar', async () => {
    await open(full);
    expect(text('.sn-hostpage-list .sn-empty-h')).toBe('Nothing on the calendar right now.');
    expect(href('.sn-hostpage-list .btn')).toBe('/sanctuary');
  });

  test('another signed-in person sees the public page, not the organiser’s', async () => {
    signedInAs('someone-else');
    await open(full);
    expect($('.sn-org-owner')).toBeNull();
    expect(text('.sn-back')).toBe('← All events');
  });

  test('a page that isn’t public says the organiser isn’t on the calendar', async () => {
    await open(null);
    expect(text('.sn-empty-h')).toBe('This organiser isn’t on the calendar.');
  });
});

describe('the organiser on their own profile', () => {
  test('a strip says it’s the page visitors see, what’s still empty, and what isn’t public yet', async () => {
    signedInAs(HOST);
    getMyHost.mockResolvedValue({ user_id: HOST, status: 'approved' });
    listMyGatherings.mockResolvedValue([
      mineRow('in_review'),
      mineRow('draft'),
      mineRow('published'),
      { ...mineRow('in_review', 'someone-elses'), host_id: 'other' }, // never counted
    ]);
    await open(thin, { rows: [event] });

    const strip = text('.sn-org-owner');
    expect(strip).toContain('This is your profile, as visitors see it.');
    expect(strip).toContain('Add a profile photo, a few lines about your work and a cover photo');
    expect(strip).toContain('1 event is waiting for review. It shows here once it’s approved.');
    expect(strip).toContain('1 draft only you can see.');
    expect($$('.sn-org-owner a').map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['Edit your profile', '/sanctuary/host/profile'],
      ['Manage your events', '/sanctuary/host'],
    ]);
    expect(text('.sn-back')).toBe('← Your events');
    expect(href('.sn-back')).toBe('/sanctuary/host');
  });

  test('a finished profile with nothing pending: just the strip’s first line', async () => {
    signedInAs(HOST);
    getMyHost.mockResolvedValue({ user_id: HOST, status: 'approved' });
    listMyGatherings.mockResolvedValue([]);
    await open(full, { rows: [event] });
    expect($$('.sn-org-owner p').map((p) => p.textContent)).toEqual(['This is your profile, as visitors see it.']);
  });

  test('nothing of theirs on the calendar: the way to create one, in their own words', async () => {
    signedInAs(HOST);
    getMyHost.mockResolvedValue({ user_id: HOST, status: 'approved' });
    listMyGatherings.mockResolvedValue([]);
    await open(full);
    expect(text('.sn-hostpage-list .sn-empty-h')).toBe('None of your events are on the calendar right now.');
    expect(href('.sn-hostpage-list .btn')).toBe('/sanctuary/host/new');
  });

  test('when reading their own events fails, the page and strip still show', async () => {
    signedInAs(HOST);
    getMyHost.mockRejectedValue(new Error('offline'));
    listMyGatherings.mockRejectedValue(new Error('offline'));
    await open(full);
    expect(text('h1')).toBe('Nandhini Ravi');
    expect(text('.sn-org-owner')).toContain('This is your profile, as visitors see it.');
  });

  test.each([
    ['paused', 'Your profile is paused.'],
    ['requested', 'Your profile isn’t public yet.'],
    ['declined', 'Your profile isn’t public.'],
    [null, 'Your profile isn’t public right now.'],
  ])('hidden from visitors (%s): says why to them, not “taking a break”', async (status, heading) => {
    signedInAs(HOST);
    getMyHost.mockResolvedValue(status ? { user_id: HOST, status } : null);
    listMyGatherings.mockResolvedValue([]);
    await open(null);
    expect(text('.sn-empty-h')).toBe(heading);
    expect(href('.sn-empty .btn')).toBe('/sanctuary/host');
  });
});
