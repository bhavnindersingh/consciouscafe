import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import GatheringPage from './GatheringPage';
import { getGathering, listSeriesDates, reservePlaces } from '../../services/sanctuaryService';
import { formatWhen, formatWhenLong } from '../../utils/sanctuary';

jest.mock('../../services/sanctuaryService', () => ({
  getGathering: jest.fn(),
  listSeriesDates: jest.fn(),
  reservePlaces: jest.fn(),
  imageUrl: (p) => (p ? `https://img.test/${p}` : ''),
  videoFileUrl: () => '',
}));

global.IS_REACT_ACT_ENVIRONMENT = true;
Element.prototype.scrollIntoView = jest.fn();

const DAY = 86400e3;
const iso = (ms) => new Date(ms).toISOString();
const soon = Date.now() + 3 * DAY;
const ID = '816b9ae8-ac28-49ed-bd69-75e5154e227e';
const HOST = '82939aa2-4724-488c-b22f-c8103b76c1b2';

const base = {
  id: ID, kind: 'class', title: 'Morning Hatha', description: 'A slow morning practice.\n\nMats are here to borrow.',
  starts_at: iso(soon), ends_at: iso(soon + 75 * 60e3), status: 'published', at_sanctuary: true,
  location: 'Conscious Sanctuary, Auroville Road', price_inr: 500, capacity: 15, seats_left: 13,
  host_id: HOST, host_name: 'Linda', host_avatar_path: 'linda/avatar.jpg', image_path: null, series_id: null,
};
const later = (n, extra = {}) => ({ ...base, id: `${ID.slice(0, -1)}${n}`, starts_at: iso(soon + n * 2 * DAY), ends_at: iso(soon + n * 2 * DAY + 75 * 60e3), seats_left: 14, ...extra });

let root; let el;
beforeEach(() => {
  el = document.createElement('div'); document.body.appendChild(el);
  getGathering.mockReset(); listSeriesDates.mockReset(); reservePlaces.mockReset();
  listSeriesDates.mockResolvedValue([]);
});
afterEach(() => { act(() => root.unmount()); el.remove(); });

async function open(row, series) {
  getGathering.mockResolvedValue(row);
  if (series) listSeriesDates.mockResolvedValue(series);
  root = createRoot(el);
  await act(async () => {
    root.render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[`/sanctuary/${ID}`]}>
          <Routes><Route path="/sanctuary/:id" element={<GatheringPage />} /></Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );
  });
  await act(async () => {}); // the series dates load after the event itself
}
const $ = (s) => el.querySelector(s);
const $$ = (s) => [...el.querySelectorAll(s)];
const text = (s) => $(s)?.textContent.trim();

function type(input, value) {
  const proto = input.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, value);
  input.dispatchEvent(new Event(input.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
}
const submit = () => act(async () => { $('form.sn-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });

test('a weekly class: what, when and where up top; the panel names the date; other dates are just dates', async () => {
  const row = { ...base, series_id: 's1' };
  await open(row, [row, later(1, { series_id: 's1' }), later(2, { series_id: 's1', seats_left: 0 })]);

  expect(text('h1')).toBe('Morning Hatha');
  expect(text('.sn-row-tags')).toContain('Every');
  expect(text('.sn-detail-when')).toBe(formatWhenLong(row.starts_at, row.ends_at));
  expect(text('.sn-detail-where')).toBe('Conscious Sanctuary, Auroville Road');
  expect($('.sn-detail-where a')).toBeNull(); // the Sanctuary needs no map link
  expect(text('.sn-detail-sum')).toContain('₹500, paid at the venue');

  // the panel: the date being booked, the price once, a dot per place
  expect(text('.sn-panel-when')).toBe(formatWhen(row.starts_at, row.ends_at));
  expect(text('.sn-panel-price')).toBe('₹500per person, paid at the venue');
  expect($$('.sn-pulli i')).toHaveLength(15);
  expect($$('.sn-pulli i.is-open')).toHaveLength(13);
  expect(text('.sn-panel-places .sn-seats')).toBe('13 places left');
  expect(text('.sn-panel-note')).toContain('Each date is reserved on its own.');
  $('.sn-panel-jump').click();
  expect(Element.prototype.scrollIntoView).toHaveBeenCalled();

  // other dates: no title repeated, each its own link, a full one says so
  const dates = $$('a.sn-date');
  expect(dates).toHaveLength(2);
  expect(dates[0].getAttribute('href')).toBe(`/sanctuary/${later(1).id}`);
  expect(dates[0].textContent).not.toContain('Morning Hatha');
  expect(dates[0].textContent).toContain('Reserve');
  expect(dates[1].textContent).toContain('Full');
  expect(dates[1].textContent).toContain('See details');

  // the organiser: one link to their page
  const by = $('a.sn-byline');
  expect(by.getAttribute('href')).toBe(`/sanctuary/hosts/${HOST}`);
  expect(by.textContent).toContain('Linda');
  expect(by.textContent).toContain('Visit organiser profile');
  expect($$(`a[href="/sanctuary/hosts/${HOST}"]`)).toHaveLength(1);
});

test('reserving: errors on submit say what is missing, then the booking goes through', async () => {
  await open(base);
  expect($('.sn-panel-note')).toBeNull(); // a one-off has no other dates to point at

  await submit();
  expect(reservePlaces).not.toHaveBeenCalled();
  expect($$('.sn-err').map((e) => e.textContent)).toEqual(['Your name, please.', 'A phone number we can reach you on.']);

  act(() => { type($('#sn-r-name'), 'Asha Rao'); });
  expect($$('.sn-err')).toHaveLength(1); // typing clears that field's error

  act(() => { type($('#sn-r-phone'), '98765 43210'); type($('#sn-r-seats'), '2'); });
  reservePlaces.mockResolvedValue({ seats_left: 11 });
  await submit();

  expect(reservePlaces).toHaveBeenCalledWith({ offeringId: ID, name: 'Asha Rao', phone: '+919876543210', email: null, seats: 2 });
  expect(text('.sn-done-h')).toBe('You’re in, Asha.');
  expect(text('.sn-done')).toContain('2 places are held for you');
  expect($('.sn-done a.btn').getAttribute('href')).toContain('calendar.google.com');
  expect($('form.sn-form')).toBeNull();
  expect($$('.sn-pulli i.is-open')).toHaveLength(11); // what the RPC said is left
});

test('a refused booking shows the reason and keeps the form', async () => {
  await open(base);
  act(() => { type($('#sn-r-name'), 'Asha'); type($('#sn-r-phone'), '9876543210'); });
  reservePlaces.mockRejectedValue(new Error('already_booked'));
  await submit();
  expect(text('.sn-failure')).toBe('This phone number already has a place reserved for this one.');
  expect($('form.sn-form')).not.toBeNull();
});

test.each([
  ['full', { seats_left: 0 }, 'Every place is taken.', 'Full', 'WhatsApp us'],
  ['cancelled', { status: 'cancelled' }, 'This event has been cancelled.', 'Cancelled', 'See what’s on'],
  ['past', { starts_at: iso(Date.now() - 2 * DAY), ends_at: iso(Date.now() - 2 * DAY + 3600e3) }, 'This one has passed.', 'This has passed', 'See what’s on'],
])('%s: no form, says so in the panel and under the title', async (_, change, heading, word, button) => {
  await open({ ...base, ...change });
  expect($('form.sn-form')).toBeNull();
  expect(text('.sn-closed .sn-done-h')).toBe(heading);
  expect(text('.sn-detail-sum .sn-seats')).toBe(word);
  expect(text('.sn-closed .btn')).toBe(button);
  if (_ === 'full') expect($$('.sn-pulli i.is-open')).toHaveLength(0); // every dot taken
  else expect($('.sn-pulli')).toBeNull();
});

test('an outside event: the place links to a map, it says Linda’s curation, and a big room gets words, not dots', async () => {
  await open({ ...base, at_sanctuary: false, location: 'The Courtyard Cinema, Auroville', capacity: 60, seats_left: 60, price_inr: null });
  const map = $('.sn-detail-where a');
  expect(map.getAttribute('href')).toContain('google.com/maps');
  expect(map.getAttribute('target')).toBe('_blank');
  expect(map.textContent).toContain('(opens a map)');
  expect(text('.sn-away-tag')).toBe('Linda’s curation');
  expect($('.sn-pulli')).toBeNull();
  expect(text('.sn-panel-places .sn-seats')).toBe('60 places left');
  expect(text('.sn-panel-price')).toBe('Free');
});

test('an organiser without a page is named, not linked; no limit means open to all', async () => {
  await open({ ...base, host_id: null, capacity: null, seats_left: null });
  expect($('a.sn-byline')).toBeNull();
  expect(text('.sn-byline')).toContain('Linda');
  expect(text('.sn-byline')).not.toContain('Visit organiser profile');
  expect(text('.sn-panel-places .sn-seats')).toBe('Open to all');
});

test('a link to something that isn’t on the calendar says so', async () => {
  await open(null);
  expect(text('.sn-empty-h')).toBe('This gathering isn’t on the calendar.');
  expect($('a.btn').getAttribute('href')).toBe('/sanctuary');
});
