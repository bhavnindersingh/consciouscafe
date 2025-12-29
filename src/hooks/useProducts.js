import { useMemo } from 'react';

/**
 * Custom hook for product operations and filtering
 * @param {Array} products - Array of all products
 * @returns {Object} Product utilities and filtered data
 */
export function useProducts(products) {
  /**
   * Get products by category
   */
  const getProductsByCategory = useMemo(() => {
    return (categoryId) => {
      if (!products || !categoryId) return [];
      if (categoryId === 'all') return products;

      return products.filter(
        (product) => product.category.toLowerCase() === categoryId.toLowerCase()
      );
    };
  }, [products]);

  /**
   * Search products by name or description
   */
  const searchProducts = useMemo(() => {
    return (searchTerm) => {
      if (!products || !searchTerm) return products;

      const term = searchTerm.toLowerCase();
      return products.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term)
      );
    };
  }, [products]);

  /**
   * Get bestseller products
   */
  const getBestsellers = useMemo(() => {
    if (!products) return [];

    const bestsellers = products.filter((product) => product.bestseller);
    // If no bestsellers are marked, just take the first 6 products
    return bestsellers.length > 0 ? bestsellers : products.slice(0, 6);
  }, [products]);

  /**
   * Get product by slug
   */
  const getProductBySlug = useMemo(() => {
    return (slug) => {
      if (!products || !slug) return null;

      return products.find((product) => {
        const productSlug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        return productSlug === slug;
      });
    };
  }, [products]);

  /**
   * Create slug from product name
   */
  const createSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  /**
   * Get unique categories
   */
  const categories = useMemo(() => {
    if (!products) return [];

    const uniqueCategories = [...new Set(products.map((p) => p.category))];
    return uniqueCategories.sort();
  }, [products]);

  return {
    getProductsByCategory,
    searchProducts,
    getBestsellers,
    getProductBySlug,
    createSlug,
    categories,
    totalProducts: products?.length || 0,
  };
}
