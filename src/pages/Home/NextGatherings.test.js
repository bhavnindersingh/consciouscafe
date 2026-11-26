import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import NextGatherings from './NextGatherings';
import { listGatherings } from '../../services/sanctuaryService';

jest.mock('../../services/sanctuaryService', () => ({
  listGatherings: jest.fn(),
  imageUrl: () => '',
}));

global.IS_REACT_ACT_ENVIRONMENT = true;

const row = (id, extra = {}) => ({
  id, kind: 'class', title: `Gathering ${id}`, status: 'published',
  starts_at: '2026-11-10T01:30:00Z', ends_at: '2026-11-10T02:45:00Z',
  host_name: 'Asha', series_id: null, price_inr: null, capacity: null, seats_left: null, image_path: null,
  ...extra,
});

let root; let el;
beforeEach(() => { jest.useFakeTimers(); el = document.createElement('div'); document.body.appendChild(el); });
afterEach(() => { act(() => root.unmount()); el.remove(); jest.useRealTimers(); });

// jsdom has no IntersectionObserver, so the fetch waits for the idle timer.
async function mount() {
  root = createRoot(el);
  await act(async () => { root.render(<MemoryRouter><NextGatherings /></MemoryRouter>); });
  expect(el.textContent).toContain('Looking up the calendar');
  await act(async () => { jest.advanceTimersByTime(3000); });
  await act(async () => { await Promise.resolve(); });
}

test('empty calendar: a quiet note and the host link, no rows', async () => {
  listGatherings.mockResolvedValue([]);
  await mount();
  expect(el.querySelectorAll('.home-next-row')).toHaveLength(0);
  expect(el.querySelector('.home-next-empty').textContent).toContain('Nothing on the Sanctuary’s calendar just yet');
  expect(el.querySelector('.home-next-empty a').getAttribute('href')).toBe('/sanctuary/host');
  expect(el.querySelector('.home-next-all').getAttribute('href')).toBe('/sanctuary');
});

test('one gathering reads as the next one and links to its page', async () => {
  listGatherings.mockResolvedValue([row('a')]);
  await mount();
  expect(el.querySelector('.home-next-h').textContent).toBe('Next at the Sanctuary');
  const links = el.querySelectorAll('a.home-next-row');
  expect(links).toHaveLength(1);
  expect(links[0].getAttribute('href')).toBe('/sanctuary/a');
  expect(links[0].textContent).toContain('Tue 10 Nov');
  expect(links[0].textContent).toContain('with Asha');
});

test('several: capped at three, a weekly series shown once with its other dates', async () => {
  listGatherings.mockResolvedValue([
    row('s1', { series_id: 'S' }),
    row('s2', { series_id: 'S', starts_at: '2026-11-12T01:30:00Z', ends_at: '2026-11-12T02:45:00Z' }),
    row('b', { kind: 'workshop', starts_at: '2026-11-15T04:30:00Z', ends_at: '2026-11-16T10:30:00Z' }),
    row('c', { kind: 'event', starts_at: '2026-11-21T13:00:00Z', ends_at: '2026-11-21T15:00:00Z' }),
    row('d', { starts_at: '2026-11-28T01:30:00Z', ends_at: '2026-11-28T02:45:00Z' }),
  ]);
  await mount();
  expect(el.querySelector('.home-next-h').textContent).toBe('What’s on at the Sanctuary');
  const links = [...el.querySelectorAll('a.home-next-row')].map((a) => a.getAttribute('href'));
  expect(links).toEqual(['/sanctuary/s1', '/sanctuary/b', '/sanctuary/c']);
  expect(el.querySelector('.home-next-row').textContent).toContain('and 1 more date');
  expect(el.querySelector('.home-next-repeat').textContent).toBe('Every Tue & Thu');
});

test('error: a short line and the calendar link, nothing thrown', async () => {
  listGatherings.mockRejectedValue(new Error('offline'));
  await mount();
  expect(el.querySelectorAll('.home-next-row')).toHaveLength(0);
  expect(el.querySelector('.home-next-error').textContent).toContain('didn’t load');
  expect(el.querySelector('.home-next-error a').getAttribute('href')).toBe('/sanctuary');
});

test('only the Sanctuary’s own events, capped after filtering; the rest counted under Linda’s curation', async () => {
  const away = (id, extra = {}) => row(id, { at_sanctuary: false, location: 'Pondy Bazaar', ...extra });
  listGatherings.mockResolvedValue([
    away('x1'),
    row('a', { price_inr: 500, capacity: 12, seats_left: 3 }),
    away('x2', { starts_at: '2026-11-11T01:30:00Z', ends_at: '2026-11-11T02:45:00Z' }),
    row('b', { starts_at: '2026-11-12T01:30:00Z', ends_at: '2026-11-12T02:45:00Z', capacity: 10, seats_left: 0 }),
    row('c', { starts_at: '2026-11-13T01:30:00Z', ends_at: '2026-11-13T02:45:00Z' }),
    row('d', { starts_at: '2026-11-14T01:30:00Z', ends_at: '2026-11-14T02:45:00Z' }),
  ]);
  await mount();
  const links = [...el.querySelectorAll('a.home-next-row')];
  expect(links.map((a) => a.getAttribute('href'))).toEqual(['/sanctuary/a', '/sanctuary/b', '/sanctuary/c']);
  expect(links[0].querySelector('.home-next-price').textContent).toBe('₹500');
  expect(links[0].querySelector('.home-next-seats').textContent).toBe('Last 3 places');
  expect(links[0].querySelector('.home-next-go').textContent).toBe('Reserve');
  expect(links[1].querySelector('.home-next-seats').classList.contains('is-full')).toBe(true);
  expect(links[1].querySelector('.home-next-go').textContent).toBe('See details');
  const awayLine = el.querySelector('.home-next-away');
  expect(awayLine.textContent).toContain('2 more events');
  expect(awayLine.querySelector('a').getAttribute('href')).toBe('/sanctuary#curation');
});

test('nothing in the Sanctuary but some elsewhere: the empty note, and the way to them', async () => {
  listGatherings.mockResolvedValue([row('x1', { at_sanctuary: false, location: 'Pondy Bazaar' })]);
  await mount();
  expect(el.querySelectorAll('.home-next-row')).toHaveLength(0);
  expect(el.querySelector('.home-next-empty').textContent).toContain('Nothing on the Sanctuary’s calendar just yet');
  expect(el.querySelector('.home-next-away').textContent).toContain('1 more event in');
});

test('no outside events, no line about them', async () => {
  listGatherings.mockResolvedValue([row('a')]);
  await mount();
  expect(el.querySelector('.home-next-away')).toBeNull();
});
