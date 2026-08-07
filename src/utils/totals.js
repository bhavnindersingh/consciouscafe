import { toSlug } from './slug';

// The one bill calculation for the site. Checkout renders it and the WhatsApp
// message repeats it — they must never drift, so both read from here.
//
// Mirrors the POS (`Manager Conscious Cafe`, orderService.js):
//   packaging = Σ qty × rate[item category]      (rounded to 2dp)
//   GST       = 2 × round₂((subtotal + packaging) × 2.5%)
//   total     = subtotal + packaging + GST
// Verified against live orders — e.g. #T08260027, 3 × Patisserie → ₹120.
//
// Every website order is a delivery, and delivery is packed, so every line
// carries its category's packaging rate. In the POS that flag is per item
// (`needs_packaging`, auto-on for takeaway); here it is implicit.

export const GST_RATE = 0.05;

const round2 = (n) => parseFloat(n.toFixed(2));

/**
 * Packaging rate for one unit of a cart line.
 *
 * The POS keys `app_settings.packaging_charges` by the raw top-level
 * `recipes.category` string, so match that first — our number is then the same
 * number the cafe bills. Deliberately never the sub-category: the rate map also
 * holds keys like "Cakes" and "Wood Fire Oven" that are `sub_category` values,
 * and the POS reads `recipe.category` only, so those keys are dead on both
 * sides. Slug matching is the fallback for carts saved in
 * localStorage before `posCategory` existed, where only `mainCategory` (a slug)
 * survives. A category with no rate contributes ₹0, exactly as in the POS.
 */
export function unitPackagingRate(item, rates) {
  if (!rates) return 0;
  const raw = item.posCategory;
  if (raw && rates[raw] != null) return parseFloat(rates[raw]) || 0;

  const wanted = toSlug(raw || item.mainCategory || '');
  if (!wanted) return 0;
  const hit = Object.entries(rates).find(([key]) => toSlug(key) === wanted);
  return hit ? parseFloat(hit[1]) || 0 : 0;
}

/**
 * Bill for a cart.
 *
 * `rates` null/empty means the rate card could not be loaded (Supabase blip on
 * a first-ever visit). Packaging then comes back `null` rather than 0 so
 * callers can say "confirmed on order" instead of quoting a total that is
 * short by ₹40 a dish.
 */
export function calcTotals(cartItems = [], rates = null) {
  const subtotal = round2(
    cartItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0)
  );

  const ratesKnown = Boolean(rates && Object.keys(rates).length);
  const packaging = ratesKnown
    ? round2(
        cartItems.reduce(
          (s, i) => s + (i.quantity || 1) * unitPackagingRate(i, rates),
          0
        )
      )
    : null;

  const preGst = round2(subtotal + (packaging || 0));
  const half = round2(preGst * 0.025);
  const gst = round2(half * 2);

  return {
    subtotal,
    packaging,
    packagingKnown: ratesKnown,
    gst,
    total: round2(preGst + gst),
  };
}
