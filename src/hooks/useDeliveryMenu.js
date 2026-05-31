import { useState, useEffect, useMemo, useCallback } from 'react';
import { getDeliveryMenu } from '../services/menuService';

const toSlug = (name) =>
  (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

export function useDeliveryMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDeliveryMenu()
      .then(setItems)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  // Unique categories in the order they appear, sorted alphabetically by name
  const categories = useMemo(() => {
    const seen = new Set();
    const cats = [];
    items.forEach((item) => {
      if (!seen.has(item.category)) {
        seen.add(item.category);
        cats.push({
          id: item.category,
          name: item.category
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        });
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

  return { items, loading, error, categories, getByCategory, getBySlug, searchItems };
}
