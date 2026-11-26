import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import CalendarView, { popPlacement } from './CalendarView';
import { istToday, istToIso, isoToIstParts } from '../../utils/sanctuary';

jest.mock('../../services/sanctuaryService', () => ({ imageUrl: () => '', videoFileUrl: () => '' }));

global.IS_REACT_ACT_ENVIRONMENT = true;

// One day two days ahead (IST), whatever the hour the test runs at.
const DAY = isoToIstParts(new Date(Date.parse(istToIso(istToday(), '12:00')) + 2 * 86400e3).toISOString()).date;
const at = (time) => istToIso(DAY, time);
const items = [
  { id: 'a', kind: 'class', title: 'Morning Hatha', starts_at: at('07:00'), ends_at: at('08:15'), host_name: 'Linda', price_inr: 500, capacity: 12, seats_left: 4, image_path: null },
  { id: 'b', kind: 'event', title: 'Kirtan evening', starts_at: at('19:00'), ends_at: at('21:00'), host_name: 'Linda', price_inr: null, capacity: null, seats_left: null, image_path: null },
];

let root; let el;
beforeEach(() => { el = document.createElement('div'); document.body.appendChild(el); });
afterEach(() => { act(() => root.unmount()); el.remove(); });

function mount(list = items) {
  root = createRoot(el);
  act(() => { root.render(<MemoryRouter><CalendarView items={list} /></MemoryRouter>); });
}
const pop = () => el.querySelector('[role="dialog"]');
const day = () => el.querySelector('button.sn-cal-day.has');

test('nothing opens by itself; a day opens its pop-up, and Escape puts focus back on the day', () => {
  mount();
  expect(pop()).toBeNull();
  expect(el.querySelector('.sn-cal-hint').textContent).toContain('Pick a day');
  expect(day().getAttribute('aria-expanded')).toBe('false');

  act(() => { day().click(); });
  expect(pop()).not.toBeNull();
  expect(day().getAttribute('aria-expanded')).toBe('true');
  expect(pop().getAttribute('aria-labelledby')).toBe('sn-pop-h');
  const rows = pop().querySelectorAll('a.sn-row');
  expect(rows).toHaveLength(2);
  expect(rows[0].getAttribute('href')).toBe('/sanctuary/a');
  expect(rows[0].textContent).toContain('Morning Hatha');
  expect(rows[0].textContent).toContain('7 – 8:15 am');
  expect(rows[0].textContent).not.toMatch(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun) \d/); // time only — the day is the heading
  expect(document.activeElement.className).toBe('sn-pop-close');

  act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
  expect(pop()).toBeNull();
  expect(document.activeElement).toBe(day());
});

test('× closes it, and the same day again closes it too', () => {
  mount();
  act(() => { day().click(); });
  act(() => { pop().querySelector('.sn-pop-close').click(); });
  expect(pop()).toBeNull();
  act(() => { day().click(); });
  act(() => { day().click(); });
  expect(pop()).toBeNull();
});

test('a tap outside closes it', () => {
  mount();
  act(() => { day().click(); });
  act(() => { document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })); });
  expect(pop()).toBeNull();
});

describe('popPlacement', () => {
  const grid = { left: 0, top: 0, width: 1120, height: 600, bottom: 600 };
  const cell = (col, row, w = 160, h = 100) => ({ left: col * w, top: row * h, width: w, height: h, bottom: (row + 1) * h });

  test('right of the day when there is room, else left of it', () => {
    expect(popPlacement(grid, cell(0, 0))).toMatchObject({ left: 168, width: 420, up: false, y: 0 });
    expect(popPlacement(grid, cell(6, 0))).toMatchObject({ left: 960 - 8 - 420 });
  });

  test('over the day when neither side fits, never past the edge', () => {
    const narrow = { ...grid, width: 700 };
    const p = popPlacement(narrow, cell(3, 0, 100));
    expect(p.left).toBeGreaterThanOrEqual(0);
    expect(p.left + p.width).toBeLessThanOrEqual(700);
    expect(popPlacement({ ...grid, width: 300 }, cell(0, 0, 40)).width).toBe(300);
  });

  test('a day in the lower half opens upward', () => {
    expect(popPlacement(grid, cell(1, 5))).toMatchObject({ up: true, y: 0 });
    expect(popPlacement(grid, cell(1, 4))).toMatchObject({ up: true, y: 100 });
  });
});
