import { calcTotals, unitPackagingRate } from './totals';

// The live rate card at the time of writing (app_settings.packaging_charges).
const RATES = {
  Food: 40,
  Cakes: 40,
  Drinks: 20,
  Research: 400,
  Components: 100,
  Condiments: 400,
  Patisserie: 40,
  'Wood Fire Oven': 25,
};

const line = (posCategory, price, quantity = 1) => ({
  posCategory,
  mainCategory: posCategory.toLowerCase().replace(/\s+/g, '-'),
  price,
  quantity,
});

describe('calcTotals matches the POS bill', () => {
  // Real orders, replayed. If these drift, the site is quoting a total the
  // cafe cannot honour — check orderService.js in `Manager Conscious Cafe`.
  test('#T08260027 — 3 × Patisserie packed', () => {
    const { packaging } = calcTotals([line('Patisserie', 100, 3)], RATES);
    expect(packaging).toBe(120);
  });

  test('#S07261067 — one Food, one Drinks', () => {
    const { packaging } = calcTotals(
      [line('Food', 300), line('Drinks', 150)],
      RATES
    );
    expect(packaging).toBe(60);
  });

  test('GST is charged on subtotal + packaging, POS rounding', () => {
    // ₹350 Patisserie + ₹40 packaging → 2 × round₂(390 × 2.5%) = ₹19.50
    const { subtotal, packaging, gst, total } = calcTotals(
      [line('Patisserie', 350)],
      RATES
    );
    expect([subtotal, packaging, gst, total]).toEqual([350, 40, 19.5, 409.5]);
  });

  test('half-paisa rounding follows the POS split, not a flat 5%', () => {
    // 2469 + 0 → 2 × round₂(61.725) = 123.46, not 123.45
    const { gst } = calcTotals([line('Extras', 2469)], RATES);
    expect(gst).toBe(123.46);
  });
});

describe('category lookup', () => {
  test('a category with no rate packs free, as in the POS', () => {
    expect(unitPackagingRate(line('Extras', 100), RATES)).toBe(0);
  });

  test('falls back to the slug for carts saved before posCategory existed', () => {
    const legacy = { mainCategory: 'patisserie', price: 400, quantity: 2 };
    expect(unitPackagingRate(legacy, RATES)).toBe(40);
    expect(calcTotals([legacy], RATES).packaging).toBe(80);
  });

  // The rate map also holds keys the POS never reads — 'Cakes' and
  // 'Wood Fire Oven' are sub_category values, and both the POS and this file
  // look up the top-level category only. Match on the top level, not the leaf.
  test('a sub-category rate key is not applied to its parent category', () => {
    const cake = { posCategory: 'Patisserie', category: 'cakes', price: 450, quantity: 1 };
    expect(unitPackagingRate(cake, RATES)).toBe(40);
  });

  test('unknown rates report as unknown rather than zero', () => {
    const { packaging, packagingKnown, total } = calcTotals([line('Food', 400)], null);
    expect(packaging).toBeNull();
    expect(packagingKnown).toBe(false);
    expect(total).toBe(420); // subtotal + GST only — callers must flag this
  });
});
