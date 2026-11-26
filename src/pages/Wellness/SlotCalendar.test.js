import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import SlotCalendar from './SlotCalendar';
import { getCalendar } from '../../services/wellnessService';
import { istToday, istToIso, addDays } from '../../utils/sanctuary';

jest.mock('../../services/wellnessService', () => ({ getCalendar: jest.fn() }));

global.IS_REACT_ACT_ENVIRONMENT = true;

// Tomorrow and the day after (IST), 9:30 and 10:30 am — never past when the test runs.
const D1 = addDays(istToday(), 1);
const D2 = addDays(istToday(), 2);
const slot = (date, time, state) => {
  const start = istToIso(date, time);
  return { slot_start: start, slot_end: new Date(Date.parse(start) + 3600e3).toISOString(), state };
};
const allOff = [slot(D1, '09:30', 'unavailable'), slot(D1, '10:30', 'unavailable'), slot(D2, '09:30', 'unavailable')];

let root; let el;
beforeEach(() => { el = document.createElement('div'); document.body.appendChild(el); getCalendar.mockReset(); });
afterEach(() => { act(() => root.unmount()); el.remove(); });

async function mount(props) {
  root = createRoot(el);
  await act(async () => { root.render(<SlotCalendar bookAheadDays={14} slotMinutes={60} {...props} />); });
}
const $$ = (s) => [...el.querySelectorAll(s)];

test('booking off: every time is shown and unavailable, nothing is a control, and it says why', async () => {
  getCalendar.mockResolvedValue(allOff);
  await mount({ open: false, onPick: jest.fn() });
  expect(getCalendar).toHaveBeenCalledWith(istToday(), 7);
  expect(el.querySelector('h2').textContent).toBe('Session times');
  expect(el.textContent).toContain('Online booking isn’t open yet, so every time shows as unavailable.');
  expect($$('.wl-cal-day')).toHaveLength(7);
  expect($$('.wl-cal-slot.is-unavailable')).toHaveLength(3);
  expect($$('.wl-cal-slot')[0].textContent).toBe('9:30 am, unavailable');
  expect($$('.wl-cal-days button')).toHaveLength(0);
  expect($$('.wl-cal-shut').length).toBeGreaterThan(0); // the days with no hours say Closed
});

test('booking on: an open time picks its day; full and unavailable ones don’t', async () => {
  getCalendar.mockResolvedValue([slot(D1, '09:30', 'open'), slot(D1, '10:30', 'full'), slot(D2, '09:30', 'unavailable')]);
  const onPick = jest.fn();
  await mount({ open: true, onPick });
  const buttons = $$('.wl-cal-days button');
  expect(buttons).toHaveLength(1);
  expect(buttons[0].getAttribute('aria-label')).toMatch(/^Book .+, 9:30 am$/);
  act(() => { buttons[0].click(); });
  expect(onPick).toHaveBeenCalledWith(D1);
  expect(el.querySelector('.wl-cal-slot.is-full').textContent).toContain('Full');
  expect(el.textContent).toContain('each session is an hour');
});

test('the next week is read when asked for, within the booking window', async () => {
  getCalendar.mockResolvedValue(allOff);
  await mount({ open: false });
  const [prev, next] = $$('.wl-cal-step');
  expect(prev.disabled).toBe(true);
  await act(async () => { next.click(); });
  expect(getCalendar).toHaveBeenLastCalledWith(addDays(istToday(), 7), 7);
  await act(async () => { next.click(); });
  expect(getCalendar).toHaveBeenLastCalledWith(addDays(istToday(), 14), 1); // only the last bookable day
  expect($$('.wl-cal-day')).toHaveLength(1);
  expect($$('.wl-cal-step')[1].disabled).toBe(true); // 14 days ahead is the end
});

test('not deployed yet, or unreadable: no calendar at all', async () => {
  getCalendar.mockResolvedValue(null);
  await mount({ open: false });
  expect(el.innerHTML).toBe('');
  act(() => root.unmount());
  getCalendar.mockRejectedValue(new Error('network'));
  await mount({ open: false });
  expect(el.innerHTML).toBe('');
});
