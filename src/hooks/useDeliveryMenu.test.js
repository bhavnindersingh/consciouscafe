import React, { useEffect, act } from 'react';
import { createRoot } from 'react-dom/client';
import { useDeliveryMenu } from './useDeliveryMenu';
import { getDeliveryMenu } from '../services/menuService';

jest.mock('../services/menuService', () => ({
  ...jest.requireActual('../services/menuService'),
  getDeliveryMenu: jest.fn(),
}));

global.IS_REACT_ACT_ENVIRONMENT = true;

const dish = (name, extra = {}) => ({
  id: name,
  name,
  price: 100,
  mainCategory: 'food',
  category: 'salads',
  posCategory: 'Food',
  availableForDelivery: true,
  ...extra,
});

const MENU = [
  dish('Sol Bowl'),
  dish('Cappuccino', { posCategory: 'Drinks', mainCategory: 'drinks', category: 'hot-coffees', availableForDelivery: false }),
  dish('Extra Eggs', { posCategory: 'Extras', mainCategory: 'extras', category: 'extras' }),
];

let seen;
const Probe = ({ scope }) => {
  const menu = useDeliveryMenu(scope);
  useEffect(() => { seen = menu; });
  return null;
};

let root;

beforeEach(() => {
  seen = null;
  localStorage.clear();
  getDeliveryMenu.mockReset();
  root = createRoot(document.createElement('div'));
});

afterEach(() => { act(() => root.unmount()); });

const render = async (scope) => {
  await act(async () => { root.render(<Probe scope={scope} />); });
};

const names = () => seen.items.map((i) => i.name);

test('the website sells only what the POS marks available for delivery', async () => {
  getDeliveryMenu.mockResolvedValue(MENU);
  await render();
  // Cappuccino is switched off in the POS; Extra Eggs is a counter add-on.
  expect(names()).toEqual(['Sol Bowl']);
});

test("the print menu is the whole kitchen, not just what travels", async () => {
  getDeliveryMenu.mockResolvedValue(MENU);
  await render('all');
  expect(names()).toEqual(['Sol Bowl', 'Cappuccino', 'Extra Eggs']);
});

test('a Supabase outage falls back to the cache, still gated', async () => {
  getDeliveryMenu.mockResolvedValueOnce(MENU);
  await render();
  expect(seen.stale).toBe(false);

  act(() => root.unmount());
  root = createRoot(document.createElement('div'));
  getDeliveryMenu.mockRejectedValueOnce(new Error('offline'));
  await render();

  expect(seen.stale).toBe(true);
  expect(seen.error).toBeNull();
  expect(names()).toEqual(['Sol Bowl']);
});

test('a v1 cache is ignored rather than filtered down to an empty menu', async () => {
  // v1 products predate availableForDelivery/posCategory — every dish in one
  // fails the website filter, which would have shown a returning visitor an
  // empty menu during an outage.
  localStorage.setItem(
    'cc_menu_cache_v1',
    JSON.stringify({ at: 1, items: [{ id: 1, name: 'Old Dish', price: 100, category: 'salads' }] })
  );
  getDeliveryMenu.mockRejectedValue(new Error('offline'));
  await render();

  expect(seen.items).toEqual([]);
  expect(seen.error).toBeTruthy(); // surfaced as an error, not a silent blank menu
});
