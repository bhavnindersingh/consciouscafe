import { menuSupabase } from './supabase/menuClient';

const toSlug = (str) =>
  (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

const toProduct = (recipe) => ({
  id: recipe.id,
  name: recipe.name,
  description: recipe.description || '',
  price: parseFloat(recipe.selling_price) || 0,
  // sub_category is the fine-grained grouping (e.g. "Coffee", "Juices")
  // fall back to the broad category if sub_category is not set
  category: toSlug(recipe.sub_category || recipe.category),
  image: recipe.delivery_image_url || recipe.image_url || null,
  sku: recipe.sku || null,
  taxRate: parseFloat(recipe.tax_rate) || 5,
});

export async function getDeliveryMenu() {
  const { data, error } = await menuSupabase
    .from('recipes')
    .select(
      'id, name, description, selling_price, category, sub_category, image_url, delivery_image_url, sku, tax_rate'
    )
    .eq('available_for_delivery', true)
    .eq('is_production_recipe', true)
    .order('category')
    .order('name');

  if (error) throw error;
  return (data || []).map(toProduct);
}
