import { menuSupabase } from './supabase/menuClient';
import { IMAGE_MAP } from '../data/imageMap';
import { getGumletUrl } from '../utils/gumlet';

const toSlug = (str) =>
  (str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

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
    // 800×1000 portrait (4:5) — matches card/sig-figure containers, sharp at 2× retina on ~400px cards
    image: localPath
      ? getGumletUrl(localPath, { width: 800, height: 1000, mode: 'crop', quality: 90, format: 'auto' })
      : fallback,
    // 1600×2000 portrait — covers the full-height detail panel at 2× retina on wide screens
    imageDetail: localPath
      ? getGumletUrl(localPath, { width: 1600, height: 2000, mode: 'crop', quality: 90, format: 'auto' })
      : fallback,
    deliveryPackagingImage: recipe.delivery_image_url || null,
    sku: recipe.sku || null,
    taxRate: parseFloat(recipe.tax_rate) || 5,
  };
};

/** Returns 2 top food + 1 top drinks + 1 top patisserie ranked by POS sales. */
export async function getSignatureDishes() {
  const { data, error } = await menuSupabase.rpc('get_signature_dishes');
  if (error) throw error;
  return (data || []).map(toProduct);
}

export async function getDeliveryMenu() {
  const { data, error } = await menuSupabase
    .from('recipes')
    .select(
      'id, name, description, selling_price, category, sub_category, image_url, delivery_image_url, sku, tax_rate'
    )
    .eq('is_production_recipe', true)
    .order('category')
    .order('name');

  if (error) throw error;
  return (data || []).map(toProduct);
}
