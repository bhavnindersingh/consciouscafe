import { menuSupabase } from './supabase/menuClient';
import { IMAGE_MAP } from '../data/imageMap';
import { getGumletUrl } from '../utils/gumlet';

const toSlug = (str) =>
  (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

const toProduct = (recipe) => {
  const slug = toSlug(recipe.name);
  const localPath = IMAGE_MAP[slug];
  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description || '',
    price: parseFloat(recipe.selling_price) || 0,
    mainCategory: toSlug(recipe.category),
    category: toSlug(recipe.sub_category || recipe.category),
    image: localPath
      ? getGumletUrl(localPath, { width: 1200, height: 900, mode: 'crop', quality: 90, format: 'auto' })
      : (recipe.image_url || null),
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
