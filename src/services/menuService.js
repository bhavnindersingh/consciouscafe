import { supabase } from './supabase/supabaseClient';
import { IMAGE_MAP } from '../data/imageMap';
import { getGumletUrl } from '../utils/gumlet';
import { toSlug } from '../utils/slug';

const toProduct = (recipe) => {
  const slug = toSlug(recipe.name);
  const localPath = IMAGE_MAP[slug];
  const fallback = recipe.image_url || null;
  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description || '',
    price: parseFloat(recipe.selling_price) || 0,
    mainCategory: toSlug(recipe.category),
    category: toSlug(recipe.sub_category || recipe.category),
    // 900×1200 portrait (3:4) — matches phone photo ratio, no cropping, sharp at 2× retina
    image: localPath
      ? getGumletUrl(localPath, { width: 900, height: 1200, mode: 'fit', quality: 90, format: 'auto' })
      : fallback,
    // 1800×2400 portrait — same 3:4 ratio, 2× size for the full-height detail panel
    imageDetail: localPath
      ? getGumletUrl(localPath, { width: 1800, height: 2400, mode: 'fit', quality: 90, format: 'auto' })
      : fallback,
    // 2000×1120 landscape (≈16:9) crop for full-bleed hero headers — sharp on wide screens
    imageHero: localPath
      ? getGumletUrl(localPath, { width: 2000, height: 1120, mode: 'crop', quality: 82, format: 'auto' })
      : fallback,
    // True when a Gumlet-optimised local photo backs image/imageHero; false means
    // image* are a raw, unsized fallback URL that pixelates if stretched full-bleed.
    hasLocalImage: Boolean(localPath),
    deliveryPackagingImage: recipe.delivery_image_url || null,
    sku: recipe.sku || null,
    taxRate: parseFloat(recipe.tax_rate) || 5,
    dietaryLabels: recipe.dietary_labels || [],
    variations: (recipe.recipe_variations || [])
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map(v => ({
        id: v.id,
        name: (v.name || '').trim(),
        price: parseFloat(v.selling_price) || 0,
        dietaryLabels: v.dietary_labels || [],
      })),
  };
};

/** Returns 2 top food + 1 top drinks + 1 top patisserie ranked by POS sales. */
export async function getSignatureDishes() {
  const { data, error } = await supabase.rpc('get_signature_dishes');
  if (error) throw error;
  return (data || []).map(toProduct);
}

export async function getDeliveryMenu() {
  const { data, error } = await supabase
    .from('recipes')
    .select(
      'id, name, description, selling_price, category, sub_category, image_url, delivery_image_url, sku, tax_rate, dietary_labels, recipe_variations(id, name, selling_price, sort_order, dietary_labels)'
    )
    .eq('is_production_recipe', true)
    .order('category')
    .order('name');

  if (error) throw error;
  return (data || []).map(toProduct);
}
