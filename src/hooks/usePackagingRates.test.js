import React, { useEffect, act } from 'react';
import { createRoot } from 'react-dom/client';
import { usePackagingRates } from './usePackagingRates';
import { getPackagingRates } from '../services/menuService';

jest.mock('../services/menuService', () => ({ getPackagingRates: jest.fn() }));

global.IS_REACT_ACT_ENVIRONMENT = true;

// Every *committed* render the hook produced, so we can assert on the frames a
// customer actually sees. Recorded in an effect, not during render: React
// discards a render pass that triggers a render-phase state update, and that
// discarded pass never reaches the screen.
//
// A committed frame of `{ rates: null, loading: false }` while the drawer is
// open is the bug — that is the state that renders "Confirmed on order" and
// relabels the footer, mid-fetch, at a customer.
let frames = [];

const Probe = ({ open }) => {
  const value = usePackagingRates(open);
  useEffect(() => { frames.push(value); });
  return null;
};

let root;

beforeEach(() => {
  frames = [];
  getPackagingRates.mockReset();
  root = createRoot(document.createElement('div'));
});

afterEach(() => {
  act(() => root.unmount());
});

const render = (open) => act(() => { root.render(<Probe open={open} />); });
const last = () => frames[frames.length - 1];

test('never commits "settled with no rates" while a fetch is in flight', async () => {
  let resolve;
  getPackagingRates.mockReturnValue(new Promise((r) => { resolve = r; }));

  render(false);
  render(true); // the frame that used to flash "not yet final"

  const openFrames = frames.slice(1);
  expect(openFrames.every((f) => f.loading || f.rates)).toBe(true);
  expect(last()).toEqual({ rates: null, loading: true });

  await act(async () => { resolve({ Food: 40 }); });
  expect(last()).toEqual({ rates: { Food: 40 }, loading: false });
});

test("a reopen refetches and never shows the previous open's rates", async () => {
  getPackagingRates.mockResolvedValueOnce({ Food: 40 });
  render(false);
  await act(async () => { render(true); });
  expect(last().rates).toEqual({ Food: 40 });

  // Rate edited in the POS between the two opens.
  getPackagingRates.mockResolvedValueOnce({ Food: 55 });
  render(false);
  render(true);
  expect(last()).toEqual({ rates: null, loading: true }); // not the stale ₹40

  await act(async () => {});
  expect(last().rates).toEqual({ Food: 55 });
  expect(getPackagingRates).toHaveBeenCalledTimes(2);
});

test('a failed fetch settles as unknown, not as zero rates', async () => {
  jest.useFakeTimers();
  getPackagingRates.mockRejectedValue(new Error('offline'));

  render(false);
  render(true);
  await act(async () => {});                              // first attempt rejects
  await act(async () => { jest.advanceTimersByTime(1200); }); // retry fires
  await act(async () => {});                              // retry rejects

  expect(last()).toEqual({ rates: null, loading: false });
  expect(getPackagingRates).toHaveBeenCalledTimes(2);
  jest.useRealTimers();
});
