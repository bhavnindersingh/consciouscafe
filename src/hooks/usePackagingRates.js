import { useState, useEffect } from 'react';
import { getPackagingRates } from '../services/menuService';

/**
 * Packaging rates keyed by raw POS category, always read live from Supabase.
 *
 * Deliberately uncached — unlike the menu, where a minutes-old price is better
 * than a blank page. A rate here is money on a bill the cafe has to honour, so
 * a stale copy would quietly bill something the POS no longer charges. It is
 * refetched every time the checkout opens, so a rate edited in the POS applies
 * to the very next order even in a tab that has been sitting open for hours.
 *
 * Returns `{ rates, loading }`. `rates` is `null` until they arrive and stays
 * `null` if the fetch fails — callers must treat that as "packaging to be
 * confirmed", never as zero (see `calcTotals` in utils/totals.js), and use
 * `loading` to avoid flashing that wording during the fetch.
 *
 * @param {boolean} active — fetch while true, and refetch on each false→true.
 */
export function usePackagingRates(active = true) {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(active);

  // Reset during render, not in the effect. Effects run after the browser has
  // the frame, so resetting there would paint one frame of the previous open's
  // rates — or, worse, of "not yet final" wording before the fetch even starts.
  // React re-runs this render with the new state before committing anything.
  const [wasActive, setWasActive] = useState(active);
  if (active !== wasActive) {
    setWasActive(active);
    if (active) {
      setRates(null);
      setLoading(true);
    }
  }

  useEffect(() => {
    if (!active) return undefined;

    let cancelled = false;
    let timer = null;

    // One retry: a single dropped request should not cost the packaging charge
    // on an order, and there is no cached copy behind this to fall back on.
    const retry = (attemptsLeft) => {
      if (attemptsLeft > 0) timer = setTimeout(() => load(attemptsLeft - 1), 1200);
      else setLoading(false);
    };

    const load = (attemptsLeft) => {
      getPackagingRates()
        .then((fresh) => {
          if (cancelled) return;
          if (fresh && Object.keys(fresh).length) {
            setRates(fresh);
            setLoading(false);
          } else {
            retry(attemptsLeft);
          }
        })
        .catch(() => {
          if (!cancelled) retry(attemptsLeft);
        });
    };

    load(1);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [active]);

  return { rates, loading };
}
