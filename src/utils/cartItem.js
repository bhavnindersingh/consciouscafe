import { toSlug } from './slug';

/**
 * Build a cart line for a chosen recipe variation.
 *
 * Variations are mutually-exclusive *forms* of a dish (e.g. a milk swap or a
 * flavour) — each carries its own complete price, not a delta. The base product
 * is the default form. We give each form a distinct cart id so "Cappuccino" and
 * "Cappuccino · Coconut Milk" sit as separate lines and never merge or
 * double-count, while the order message still reads off name + price.
 */
export function variationCartItem(product, variation, quantity = 1) {
  const { variations, ...base } = product;
  const vName = (variation.name || '').trim();
  return {
    ...base,
    id: `${product.id}::${variation.id ?? toSlug(vName)}`,
    baseId: product.id,
    variationId: variation.id ?? null,
    name: vName ? `${product.name} · ${vName}` : product.name,
    price: variation.price || product.price,
    dietaryLabels: variation.dietaryLabels?.length ? variation.dietaryLabels : product.dietaryLabels,
    quantity,
  };
}
