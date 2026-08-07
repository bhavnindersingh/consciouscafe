import { useState, useEffect, useMemo, useCallback } from 'react';
import { getDeliveryMenu, isWebsiteSellable } from '../services/menuService';
import { toSlug } from '../utils/slug';

// Last good menu, so a Supabase blip degrades to a stale menu instead of a
// blank page. Prices/names may be minutes old; the alternative is nothing.
// v2: products gained `availableForDelivery` / `posCategory`. A v1 entry has
// neither, so every dish in it would fail the website filter and a returning
// visitor would meet an empty menu — bump the key whenever the product shape
// grows a field the filters read.
const CACHE_KEY = 'cc_menu_cache_v2';

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed?.items) && parsed.items.length ? parsed.items : null;
  } catch {
    return null;
  }
};

const writeCache = (items) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items }));
  } catch {
    // Storage full or blocked — the cache is best-effort only.
  }
};

/**
 * The live menu.
 *
 * @param {'website'|'all'} scope — 'website' (default) returns only what a
 *   visitor can actually order: the POS's "Available for Delivery" dishes, minus
 *   add-on categories. 'all' returns every production recipe, for surfaces that
 *   describe the kitchen rather than sell from it — the in-cafe print menu is
 *   the whole menu regardless of what travels.
 *
 * The cache always holds the unfiltered list, so both scopes share one fetch
 * and a POS switch flipped mid-session applies on the next load either way.
 */
export function useDeliveryMenu(scope = 'website') {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // True when items came from the cache because the live fetch failed.
  const [stale, setStale] = useState(false);

  const items = useMemo(
    () => (scope === 'all' ? all : all.filter(isWebsiteSellable)),
    [all, scope]
  );

  useEffect(() => {
    let cancelled = false;
    getDeliveryMenu()
      .then((fresh) => {
        if (cancelled) return;
        setAll(fresh);
        if (fresh.length) writeCache(fresh);
      })
      .catch((err) => {
        if (cancelled) return;
        const cached = readCache();
        if (cached) {
          setAll(cached);
          setStale(true);
        } else {
          setError(err);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const toLabel = (slug) =>
    slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  // Top-level POS categories (Food, Drinks, Patisserie…)
  const mainCategories = useMemo(() => {
    const seen = new Set();
    const cats = [];
    items.forEach((item) => {
      if (!seen.has(item.mainCategory)) {
        seen.add(item.mainCategory);
        cats.push({ id: item.mainCategory, name: toLabel(item.mainCategory) });
      }
    });
    return cats.sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // Sub-categories grouped by main category
  const categoryGroups = useMemo(() => {
    const groups = {};
    items.forEach((item) => {
      if (!groups[item.mainCategory]) groups[item.mainCategory] = new Set();
      // Only add sub-category if it differs from the main category
      if (item.category !== item.mainCategory) {
        groups[item.mainCategory].add(item.category);
      }
    });
    return Object.fromEntries(
      Object.entries(groups).map(([main, subSet]) => [
        main,
        [...subSet]
          .map((id) => ({ id, name: toLabel(id) }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      ])
    );
  }, [items]);

  // Flat sub-category list (for FoodMenuPage nav pills)
  const categories = useMemo(() => {
    const seen = new Set();
    const cats = [];
    items.forEach((item) => {
      if (!seen.has(item.category)) {
        seen.add(item.category);
        cats.push({ id: item.category, name: toLabel(item.category) });
      }
    });
    return cats.sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const getByCategory = useCallback(
    (slug) => items.filter((item) => item.category === slug),
    [items]
  );

  const getBySlug = useCallback(
    (slug) => items.find((item) => toSlug(item.name) === slug) || null,
    [items]
  );

  const searchItems = useCallback(
    (term) => {
      const t = term.toLowerCase();
      return items.filter(
        (item) =>
          item.name.toLowerCase().includes(t) ||
          item.description.toLowerCase().includes(t)
      );
    },
    [items]
  );

  return { items, loading, error, stale, categories, mainCategories, categoryGroups, getByCategory, getBySlug, searchItems };
}
