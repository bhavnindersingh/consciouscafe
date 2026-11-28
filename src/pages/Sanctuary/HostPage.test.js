import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HostPage, { validateIntro } from './HostPage';
import {
  getMyHost, requestToHost, listMyGatherings, listRsvps, getMyGathering, saveGathering, listRoomBusy,
  listSeries, createSeries, updateSeries, setGatheringStatus, deleteDraft,
} from '../../services/sanctuaryService';
import { useAuth } from '../../context/AuthContext';
import { formatWhen, istToIso, istToday, addDays, isoToIstParts } from '../../utils/sanctuary';

jest.mock('../../services/sanctuaryService', () => ({
  getMyHost: jest.fn(),
  requestToHost: jest.fn(),
  updateMyHost: jest.fn(),
  listMyGatherings: jest.fn(),
  getMyGathering: jest.fn(),
  saveGathering: jest.fn(),
  setGatheringStatus: jest.fn(),
  deleteDraft: jest.fn(),
  listRsvps: jest.fn(),
  setRsvpStatus: jest.fn(),
  uploadImage: jest.fn(),
  removeImage: jest.fn(),
  imageUrl: (p) => (p ? `https://img.test/${p}` : null),
  videoFileUrl: () => '',
  createSeries: jest.fn(),
  updateSeries: jest.fn(),
  setSeriesStatus: jest.fn(),
  deleteSeriesDrafts: jest.fn(),
  uploadVideo: jest.fn(),
  removeVideo: jest.fn(),
  listRoomBusy: jest.fn(),
  listSeries: jest.fn(),
}));
jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));

global.IS_REACT_ACT_ENVIRONMENT = true;

const UID = '82939aa2-4724-488c-b22f-c8103b76c1b2';
const ASHA = { id: UID, email: 'asha@example.com', user_metadata: { full_name: 'Asha Rao' } };
const row = (over = {}) => ({
  user_id: UID, display_name: 'Asha Rao', email: 'asha@example.com', phone: null, link: null, bio: null, intro: null,
  tagline: null, avatar_path: null, cover_path: null, gallery_paths: [], place_name: null, place_address: null,
  status: 'approved', ...over,
});

let root; let el; let auth;
beforeEach(() => {
  el = document.createElement('div'); document.body.appendChild(el);
  [getMyHost, requestToHost, listMyGatherings, listRsvps, getMyGathering, saveGathering, listRoomBusy,
    listSeries, createSeries, updateSeries, setGatheringStatus, deleteDraft].forEach((f) => f.mockReset());
  listRoomBusy.mockResolvedValue([]);
  listMyGatherings.mockResolvedValue([]);
  listRsvps.mockResolvedValue([]);
  auth = { user: ASHA, loading: false, signOut: jest.fn(async () => ({ error: null })), refreshHost: jest.fn() };
  useAuth.mockImplementation(() => auth);
});
afterEach(() => { if (root) act(() => root.unmount()); root = null; el.remove(); });

async function open(path = '/sanctuary/host', state = undefined) {
  root = createRoot(el);
  await act(async () => {
    root.render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[state ? { pathname: path, state } : path]}>
          <Routes><Route path="/sanctuary/host/*" element={<HostPage />} /></Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );
  });
}
const $ = (sel) => el.querySelector(sel);
const text = (sel) => $(sel)?.textContent.replace(/\s+/g, ' ').trim();
const byText = (sel, t) => [...el.querySelectorAll(sel)].find((n) => n.textContent.trim() === t);
const type = (input, value) => act(() => {
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value').set;
  setter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
});

test('the introduction is a note to our team: it asks for one, and never calls it a profile', () => {
  expect(validateIntro({ displayName: 'Asha', intro: '', link: '', phone: '' }).errors.intro).toMatch(/few lines/);
  expect(validateIntro({ displayName: 'Asha', intro: 'Hi there', link: '', phone: '' }).errors.intro).toMatch(/A little more/);
  const ok = validateIntro({ displayName: ' Asha ', intro: '  I hold sound baths, monthly, in Auroville.  ', link: '', phone: '' });
  expect(ok.errors).toEqual({});
  expect(ok.value).toEqual({ displayName: 'Asha', intro: 'I hold sound baths, monthly, in Auroville.', link: '', phone: '' });
});

test('signed in for the first time: introduce yourself — step two of three, name filled from Google', async () => {
  getMyHost.mockResolvedValue(null);
  await open();
  expect(text('h1')).toBe('Introduce yourself');
  expect(text('.sn-join [aria-current="step"]')).toBe('2Introduce yourself');
  expect(text('.sn-join .is-done')).toContain('Sign in');
  expect($('#sn-h-name').value).toBe('Asha Rao');
  expect(text('label[for="sn-h-intro"] .sn-label')).toBe('Your introduction');
  expect(el.textContent).not.toMatch(/becomes your profile/);
  expect(text('.sn-gate-who')).toContain('asha@example.com');
});

test('sending it: the text goes to intro, not the public bio; then they see what they sent', async () => {
  getMyHost.mockResolvedValue(null);
  await open();
  // nothing written yet: say what's missing, and go there
  await act(async () => { byText('button', 'Send my introduction').click(); });
  expect(requestToHost).not.toHaveBeenCalled();
  expect(document.activeElement.id).toBe('sn-h-intro');
  expect(text('label[for="sn-h-intro"] .sn-err')).toMatch(/few lines/);

  const intro = 'I hold sound baths and would love a monthly evening at the Sanctuary.';
  type($('#sn-h-intro'), intro);
  requestToHost.mockResolvedValue(row({ status: 'requested', intro }));
  await act(async () => { byText('button', 'Send my introduction').click(); });
  expect(requestToHost).toHaveBeenCalledWith(UID, { displayName: 'Asha Rao', intro, link: '', phone: '' });
  expect(requestToHost.mock.calls[0][1]).not.toHaveProperty('bio');
  expect(auth.refreshHost).toHaveBeenCalled();
  expect(text('h1')).toBe('Thank you, Asha. Your introduction is with us.');
  expect(text('.sn-join [aria-current="step"]')).toBe('3Hear from us');
  expect(text('.sn-yours-intro')).toBe(intro);
});

test('waiting on an older request: its text was in bio, and still shows as what they sent', async () => {
  getMyHost.mockResolvedValue(row({ status: 'requested', bio: 'Potter, ten years.' }));
  await open();
  expect(text('.sn-yours-intro')).toBe('Potter, ten years.');
  expect(byText('a', 'Message us on WhatsApp ↗').getAttribute('target')).toBe('_blank');
});

test('“Not you?” signs out and stays here, on the sign-in', async () => {
  getMyHost.mockResolvedValue(null);
  await open();
  await act(async () => { byText('button', 'Not you? Sign out').click(); });
  expect(auth.signOut).toHaveBeenCalled();
});

test('just approved: a short list to get ready — profile first, then the first event; no Sign out here', async () => {
  getMyHost.mockResolvedValue(row());
  await open();
  expect(text('.sn-setup-h')).toBe('Get ready for your first event');
  const steps = [...el.querySelectorAll('.sn-setup-list li')];
  expect(steps).toHaveLength(3);
  expect(steps[0].className).toBe('is-done');
  expect(steps[1].textContent).toContain('Add a profile photo, a few lines about your work and a cover photo.');
  // the next step is the one primary button
  expect(steps[1].querySelector('.btn').textContent).toBe('Build your profile');
  expect(steps[1].querySelector('.btn').classList.contains('forest')).toBe(true);
  expect(steps[2].querySelector('.btn').classList.contains('forest')).toBe(false);
  expect(byText('button', 'Sign out')).toBeUndefined();
  // one primary button on the page: the next step, not the header's Create an event
  expect(el.querySelectorAll('.btn.forest')).toHaveLength(1);
  expect(el.querySelectorAll('.sn-empty .btn')).toHaveLength(0);
});

test('profile built, no event yet: the event is the next step', async () => {
  getMyHost.mockResolvedValue(row({ avatar_path: `${UID}/a.jpg`, bio: 'Potter.', cover_path: `${UID}/c.jpg` }));
  await open();
  const steps = [...el.querySelectorAll('.sn-setup-list li')];
  expect(steps[1].className).toBe('is-done');
  expect(steps[2].querySelector('.btn').textContent).toBe('Create an event');
  expect(steps[2].querySelector('.btn').classList.contains('forest')).toBe(true);
});

test('events made but the profile isn’t finished: the list stays, but Create an event is primary again', async () => {
  getMyHost.mockResolvedValue(row({ avatar_path: `${UID}/a.jpg`, bio: 'Potter.' }));
  listMyGatherings.mockResolvedValue([{
    id: 'e1', kind: 'event', title: 'Clay evening', status: 'draft', starts_at: new Date(Date.now() + 864e5).toISOString(),
    ends_at: new Date(Date.now() + 8.64e7 + 7.2e6).toISOString(), location: 'Conscious Sanctuary, Auroville Road', series_id: null,
  }]);
  await open();
  expect(text('.sn-setup-h')).toBe('Finish your profile');
  expect(text('.sn-setup-list li:nth-child(2)')).toContain('Add a cover photo.');
  expect(byText('.sn-dash-tools button', 'Create an event').classList.contains('forest')).toBe(true);
});

test('profile built and an event made: the list is gone', async () => {
  getMyHost.mockResolvedValue(row({ avatar_path: `${UID}/a.jpg`, bio: 'Potter.', cover_path: `${UID}/c.jpg` }));
  listMyGatherings.mockResolvedValue([{
    id: 'e1', kind: 'event', title: 'Clay evening', status: 'draft', starts_at: new Date(Date.now() + 864e5).toISOString(),
    ends_at: new Date(Date.now() + 8.64e7 + 7.2e6).toISOString(), location: 'Conscious Sanctuary, Auroville Road', series_id: null,
  }]);
  await open();
  expect($('.sn-setup')).toBeNull();
});

test('signed out: the invitation names the same three steps', async () => {
  auth = { ...auth, user: null };
  await open();
  expect(text('h1')).toBe('Organise with the Sanctuary');
  expect([...el.querySelectorAll('.sn-signin-steps strong')].map((s) => s.textContent)).toEqual(['Sign in', 'Introduce yourself', 'Hear from us.']);
});

// ── the dashboard after Send for review, and what a title opens ─────────────

const DAY = 864e5;
const at = (days, hours = 0) => new Date(Date.now() + days * DAY + hours * 36e5).toISOString();
const event = (over = {}) => ({
  id: 'b7a6c1d2-0000-4000-8000-000000000001', kind: 'class', title: 'Morning Hatha', description: '', status: 'published',
  starts_at: at(5), ends_at: at(5, 1), location: 'Conscious Sanctuary, Auroville Road', at_sanctuary: true,
  price_inr: null, capacity: null, image_path: null, video_url: null, video_path: null, series_id: null, ...over,
});
const built = () => row({ avatar_path: `${UID}/a.jpg`, bio: 'Potter.', cover_path: `${UID}/c.jpg` });
const selectedTab = () => text('[role="tab"][aria-selected="true"]');

test('two tabs: everything not over is in Upcoming, so nothing hides behind a tab', async () => {
  getMyHost.mockResolvedValue(built());
  listMyGatherings.mockResolvedValue([event(), event({ id: 'b7a6c1d2-0000-4000-8000-000000000009', title: 'Sound bath', status: 'in_review' })]);
  await open();
  expect([...el.querySelectorAll('[role="tab"]')].map((t) => t.firstChild.textContent)).toEqual(['Upcoming', 'Past']);
  expect(selectedTab()).toBe('Upcoming2');
  expect(text('.sn-part-h')).toBe('Waiting for our team1');
});

test('saving an event that’s waiting for review: it shows under Waiting for our team, and never claims it’s live', async () => {
  getMyHost.mockResolvedValue(built());
  const waiting = event({ status: 'in_review' });
  getMyGathering.mockResolvedValue(waiting);
  saveGathering.mockResolvedValue(waiting);
  listMyGatherings.mockResolvedValue([waiting, event({ id: 'b7a6c1d2-0000-4000-8000-000000000002', title: 'Kirtan' })]);
  await open(`/sanctuary/host/edit/${waiting.id}`);
  expect(text('h1')).toBe('Edit event');
  await act(async () => { byText('button', 'Save changes').click(); });
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  expect(saveGathering).toHaveBeenCalled();
  expect(text('.sn-notice')).toContain('Changes saved. It goes live once our team approves it.');
  expect(el.textContent).not.toContain('They’re live now');
  // a live event exists, and this one is on the same page, under its own heading
  expect(rowOf('Morning Hatha').closest('.sn-part').querySelector('.sn-part-h').firstChild.textContent).toBe('Waiting for our team');
});

test('a title opens the event: a live one’s page, a draft’s editor; a cancelled one stays plain', async () => {
  getMyHost.mockResolvedValue(built());
  const live = event();
  const draft = event({ id: 'b7a6c1d2-0000-4000-8000-000000000003', title: 'Clay evening', status: 'draft' });
  const off = event({ id: 'b7a6c1d2-0000-4000-8000-000000000004', title: 'Sound bath', status: 'cancelled' });
  listMyGatherings.mockResolvedValue([live, draft, off]);
  await open();
  const title = (t) => [...el.querySelectorAll('.sn-hrow .sn-row-title')].find((n) => n.textContent === t);
  expect(title('Morning Hatha').getAttribute('href')).toBe(`/sanctuary/${live.id}`);
  expect(title('Sound bath').tagName).toBe('SPAN');
  expect(title('Clay evening').getAttribute('href')).toBe(`/sanctuary/host/edit/${draft.id}`);
});

// ── where each event stands: approved, sent back, waiting, happening now ────

const ymd = (n) => addDays(istToday(), n); // a date in Auroville, n days from today
const isoDay = (o) => isoToIstParts(o.starts_at).date;
const id = (n) => `b7a6c1d2-0000-4000-8000-0000000001${String(n).padStart(2, '0')}`;
const parts = () => [...el.querySelectorAll('.sn-part-h')].map((h) => h.firstChild.textContent);
const rowOf = (t) => [...el.querySelectorAll('.sn-hrow')].find((r) => r.querySelector('.sn-row-title')?.textContent === t);
const tab = (name) => act(async () => { [...el.querySelectorAll('[role="tab"]')].find((t) => t.firstChild.textContent === name).click(); });

const MIX = () => [
  event({ id: id(1), title: 'Morning Hatha', reviewed_at: '2026-11-20T06:00:00Z' }),
  event({ id: id(2), title: 'Kirtan', starts_at: at(0, -1), ends_at: at(0, 1) }),
  event({ id: id(3), title: 'Clay evening', status: 'draft', review_note: 'Please add the address.', reviewed_at: '2026-11-21T06:00:00Z' }),
  event({ id: id(4), title: 'Sound bath', status: 'in_review', submitted_at: '2026-11-22T06:00:00Z' }),
  event({ id: id(5), title: 'Breathwork', status: 'draft' }),
];

test('Upcoming is in parts by where events stand, most urgent first, each row saying when and what next', async () => {
  getMyHost.mockResolvedValue(built());
  listMyGatherings.mockResolvedValue(MIX());
  await open();
  expect(parts()).toEqual(['Sent back to you', 'Happening now', 'Waiting for our team', 'Approved', 'Drafts']);
  expect(rowOf('Kirtan').querySelector('.sn-status').textContent).toBe('Happening now');
  const live = rowOf('Morning Hatha');
  expect(live.querySelector('.sn-status').textContent).toBe('Approved');
  expect(live.querySelector('.sn-hrow-state').textContent).toBe('On the calendar since Fri 20 Nov');

  const back = rowOf('Clay evening');
  expect(back.querySelector('.sn-status').textContent).toBe('Sent back');
  expect(back.querySelector('.sn-hrow-note').textContent).toBe('Our team’s note: “Please add the address.”');
  expect(back.querySelector('.sn-hrow-state').textContent).toBe('Sent back Sat 21 Nov');
  // changing it comes first; once changed (saved as a draft), it goes back from here
  expect(byText('a', 'Make changes').getAttribute('href')).toBe(`/sanctuary/host/edit/${id(3)}`);
  expect(byText('a', 'Make changes').className).toContain('strong');
  expect(byText('button', 'Send again').className).not.toContain('strong');
  expect(rowOf('Sound bath').querySelector('.sn-hrow-state').textContent).toBe('Sent for review Sun 22 Nov · you’ll hear by email');
  expect(rowOf('Breathwork').querySelector('.sn-status').textContent).toBe('Draft');
});

test('a weekly class says where its dates stand without being opened; “next” skips a cancelled date', async () => {
  getMyHost.mockResolvedValue(built());
  const s = 'c0ffee00-0000-4000-8000-000000000001';
  const nextOn = { starts_at: at(9), ends_at: at(9, 1) };
  listMyGatherings.mockResolvedValue([
    event({ id: id(11), series_id: s, title: 'Yin', status: 'cancelled', starts_at: at(2), ends_at: at(2, 1) }),
    event({ id: id(12), series_id: s, title: 'Yin', ...nextOn }),
    event({ id: id(13), series_id: s, title: 'Yin', starts_at: at(16), ends_at: at(16, 1) }),
  ]);
  await open();
  const head = $('.sn-hseries > .sn-hrow');
  expect([...head.querySelectorAll('.sn-status')].map((c) => c.textContent)).toEqual(['2 approved', '1 cancelled']);
  expect(head.className).toContain('st-live');
  // its dates are edited from the first one still to come, not the cancelled one
  expect(byText('a', 'Edit dates and details').getAttribute('href')).toBe(`/sanctuary/host/edit/${id(12)}`);
  expect(head.querySelector('.sn-row-meta').textContent).toBe(`3 dates · next ${formatWhen(nextOn.starts_at, nextOn.ends_at)} · 0 reserved`);
  expect(parts()).toEqual(['Approved']);
});

test('waiting when its date came: it says so, and offers a new date instead of waiting forever', async () => {
  getMyHost.mockResolvedValue(built());
  listMyGatherings.mockResolvedValue([event({ id: id(21), title: 'Full moon circle', status: 'in_review', starts_at: at(-2), ends_at: at(-2, 2) })]);
  await open();
  expect(parts()).toEqual(['Date passed']);
  const r = rowOf('Full moon circle');
  expect(r.querySelector('.sn-status').textContent).toBe('Date passed');
  expect(r.querySelector('.sn-hrow-state').textContent).toBe('Its date came before our team could approve it.');
  expect(byText('a', 'Change the date').getAttribute('href')).toBe(`/sanctuary/host/edit/${id(21)}`);
});

test('Change the date opens the editor on an event whose date came, and a new date saves', async () => {
  Element.prototype.scrollIntoView = jest.fn(); // the editor scrolls to a problem; jsdom has no layout
  getMyHost.mockResolvedValue(built());
  for (const status of ['draft', 'in_review']) {
    // 6–8 pm in Auroville two days ago: one day, whatever time the test runs
    const late = event({ id: id(31), title: 'Full moon circle', status, starts_at: istToIso(ymd(-2), '18:00'), ends_at: istToIso(ymd(-2), '20:00') });
    getMyGathering.mockResolvedValue(late);
    saveGathering.mockReset();
    saveGathering.mockResolvedValue(late);
    listMyGatherings.mockResolvedValue([late]);
    await open(`/sanctuary/host/edit/${late.id}`);
    expect(text('h1')).toBe('Edit event');
    const next = ymd(10);
    await type(el.querySelector('#sn-e-date'), next);
    // a draft goes straight back for review; one already in review keeps waiting, with its new date
    await act(async () => { byText('button', status === 'draft' ? 'Send for review' : 'Save changes').click(); });
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
    expect(saveGathering).toHaveBeenCalledTimes(1);
    expect(saveGathering.mock.calls[0][1].starts_at).toBe(istToIso(next, '18:00'));
    if (status === 'draft') expect(saveGathering.mock.calls[0][1].status).toBe('in_review');
    act(() => root.unmount()); root = null;
  }
});

test('Past is date by date, no parts: what was held, and what was called off', async () => {
  getMyHost.mockResolvedValue(built());
  listMyGatherings.mockResolvedValue([
    event({ id: id(41), title: 'Old Hatha', starts_at: at(-5), ends_at: at(-5, 1) }),
    event({ id: id(42), title: 'Old Kirtan', status: 'cancelled', starts_at: at(-4), ends_at: at(-4, 1) }),
  ]);
  await open();
  await tab('Past');
  expect(parts()).toEqual([]);
  expect(rowOf('Old Hatha').querySelector('.sn-status').textContent).toBe('Held');
  expect(rowOf('Old Kirtan').querySelector('.sn-status').textContent).toBe('Cancelled');
});

// ── a weekly class: change its days or its last date ─────────────────────────

const SERIES = 'c0ffee00-0000-4000-8000-0000000000aa';
// three Mondays from next week, 6–7:30 pm in Auroville
function mondays(status = 'published') {
  let d = ymd(7);
  while (new Date(`${d}T12:00:00Z`).getUTCDay() !== 1) d = addDays(d, 1);
  return [0, 7, 14].map((n, i) => event({
    id: id(60 + i), series_id: SERIES, title: 'Yin, slowly', status,
    starts_at: istToIso(addDays(d, n), '18:00'), ends_at: istToIso(addDays(d, n), '19:30'),
  }));
}
async function editLater(rows, rsvps = []) {
  getMyHost.mockResolvedValue(built());
  getMyGathering.mockResolvedValue(rows[0]);
  listSeries.mockResolvedValue(rows);
  listRsvps.mockResolvedValue(rsvps);
  listMyGatherings.mockResolvedValue(rows);
  updateSeries.mockResolvedValue(rows.length);
  createSeries.mockResolvedValue([]);
  await open(`/sanctuary/host/edit/${rows[0].id}`, { scope: 'following' });
}
const day = (n) => el.querySelector(`#sn-e-day-${n}`);
const preview = () => text('.sn-repeat-preview');

test('“Edit dates and details” opens with the class’s days and last date, and nothing unsaved', async () => {
  const rows = mondays();
  await editLater(rows);
  expect(text('h1')).toBe('Edit this and later dates');
  expect(day(1).getAttribute('aria-pressed')).toBe('true');
  expect(day(4).getAttribute('aria-pressed')).toBe('false');
  expect(el.querySelector('#sn-e-until').value).toBe(isoDay(rows[2]));
  expect(preview()).toContain('The dates stay as they are.');
  expect(el.textContent).not.toContain('unsaved changes');
});

test('adding Thursdays: new dates go to our team first; the rest keep their places', async () => {
  Element.prototype.scrollIntoView = jest.fn();
  const rows = mondays();
  await editLater(rows);
  await act(async () => { day(4).click(); });
  expect(preview()).toContain('new dates go to our team before they’re on the calendar');
  expect(el.querySelectorAll('.sn-series-dates .sn-new')).toHaveLength(2);
  await act(async () => { byText('button', 'Save every later date').click(); });
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  expect(createSeries).toHaveBeenCalledTimes(1);
  const added = createSeries.mock.calls[0][1];
  expect(added).toHaveLength(2);
  expect(added.every((r) => r.series_id === SERIES && r.status === 'in_review')).toBe(true);
  expect(added.map((r) => new Date(r.starts_at).getUTCDay())).toEqual([4, 4]);
  expect(updateSeries).toHaveBeenCalledTimes(1);
  expect(setGatheringStatus).not.toHaveBeenCalled();
  expect(text('.sn-notice')).toContain('2 dates added — new dates go live once our team approves them.');
});

test('an earlier last date takes live dates off — only after saying who’s booked, and it can’t be undone', async () => {
  const rows = mondays();
  await editLater(rows, [{ offering_id: rows[2].id, seats: 3, status: 'confirmed' }]);
  await type(el.querySelector('#sn-e-until'), isoDay(rows[1]));
  expect(preview()).toContain('Takes off');
  expect(preview()).toContain('3 booked on it will hear it’s off');
  await act(async () => { byText('button', 'Save every later date').click(); });
  expect(setGatheringStatus).not.toHaveBeenCalled(); // asked first
  expect(text('[role="alertdialog"]')).toContain('3 people have a place');
  expect(text('#sn-dialog-h')).toBe('Take 1 date off?');
  await act(async () => { byText('button', 'Take off and save').click(); });
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  expect(updateSeries).toHaveBeenCalledTimes(1);
  expect(setGatheringStatus).toHaveBeenCalledWith(rows[2].id, 'cancelled');
  expect(createSeries).not.toHaveBeenCalled();
});

test('a date waiting for review that’s taken off steps back to draft and goes; no day at all is refused', async () => {
  Element.prototype.scrollIntoView = jest.fn();
  const rows = mondays('in_review');
  await editLater(rows);
  await act(async () => { day(1).click(); }); // no days left
  await act(async () => { byText('button', 'Save every later date').click(); });
  expect(text('.sn-repeat-preview')).toBe('Pick at least one day.');
  expect(updateSeries).not.toHaveBeenCalled();
  await act(async () => { day(1).click(); });
  await type(el.querySelector('#sn-e-until'), isoDay(rows[0]));
  await act(async () => { byText('button', 'Save every later date').click(); });
  expect(text('#sn-dialog-h')).toBe('Take 2 dates off?'); // drafts and waiting dates ask too
  await act(async () => { byText('button', 'Take off and save').click(); });
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  expect(setGatheringStatus.mock.calls).toEqual([[rows[1].id, 'draft'], [rows[2].id, 'draft']]);
  expect(deleteDraft.mock.calls).toEqual([[rows[1].id], [rows[2].id]]);
});

test('a real class — a cancelled week, a week moved to Tuesday — opens as it is, and saving details touches no dates', async () => {
  Element.prototype.scrollIntoView = jest.fn();
  const [a, b, c] = mondays();
  const tue = addDays(isoDay(c), 1);
  const rows = [a, { ...b, status: 'cancelled' }, { ...c, starts_at: istToIso(tue, '18:00'), ends_at: istToIso(tue, '19:30') },
    event({ id: id(63), series_id: SERIES, title: 'Yin, slowly', starts_at: istToIso(addDays(isoDay(c), 7), '18:00'), ends_at: istToIso(addDays(isoDay(c), 7), '19:30') })];
  await editLater(rows);
  expect(day(1).getAttribute('aria-pressed')).toBe('true');
  expect(day(2).getAttribute('aria-pressed')).toBe('false'); // one moved week isn't a new weekday
  expect(preview()).toContain('The dates stay as they are.');
  await type(el.querySelector('#sn-e-title'), 'Yin, very slowly');
  await act(async () => { byText('button', 'Save every later date').click(); });
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  expect(updateSeries).toHaveBeenCalledTimes(1);
  expect(createSeries).not.toHaveBeenCalled();
  expect(setGatheringStatus).not.toHaveBeenCalled();
  expect(deleteDraft).not.toHaveBeenCalled();
  expect(listSeries).toHaveBeenCalledTimes(1); // opened once; no fresh diff for a details-only save
});
