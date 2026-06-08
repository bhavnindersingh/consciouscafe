-- ============================================================================
-- CONSCIOUS CAFÉ — Signature Dishes RPC
-- Run this in the Supabase SQL Editor for your MENU project
-- (the one connected to REACT_APP_MENU_SUPABASE_URL)
-- ============================================================================

-- Step 1: Add order_count column to recipes
-- Manually increment this whenever you review WhatsApp orders.
-- Defaults to 0 so all existing rows work immediately.
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS order_count integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS recipes_order_count_idx
  ON recipes (order_count DESC);

-- ============================================================================
-- Step 2: Create the RPC
-- Returns 2 top food dishes + 1 top drinks dish + 1 top patisserie dish,
-- ranked by order_count DESC within each group.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_signature_dishes()
RETURNS TABLE (
  id              bigint,
  name            text,
  description     text,
  selling_price   numeric,
  category        text,
  sub_category    text,
  image_url       text,
  delivery_image_url text,
  sku             text,
  tax_rate        numeric,
  order_count     integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  -- 2 highest-ordered food dishes
  (
    SELECT
      id, name, description, selling_price,
      category, sub_category,
      image_url, delivery_image_url,
      sku, tax_rate, order_count
    FROM recipes
    WHERE is_production_recipe = true
      AND lower(trim(category)) = 'food'
    ORDER BY order_count DESC NULLS LAST, name
    LIMIT 2
  )
  UNION ALL
  -- 1 highest-ordered drinks dish
  (
    SELECT
      id, name, description, selling_price,
      category, sub_category,
      image_url, delivery_image_url,
      sku, tax_rate, order_count
    FROM recipes
    WHERE is_production_recipe = true
      AND lower(trim(category)) = 'drinks'
    ORDER BY order_count DESC NULLS LAST, name
    LIMIT 1
  )
  UNION ALL
  -- 1 highest-ordered patisserie dish
  (
    SELECT
      id, name, description, selling_price,
      category, sub_category,
      image_url, delivery_image_url,
      sku, tax_rate, order_count
    FROM recipes
    WHERE is_production_recipe = true
      AND lower(trim(category)) = 'patisserie'
    ORDER BY order_count DESC NULLS LAST, name
    LIMIT 1
  )
$$;

-- Allow the anon (public) key to call this function
GRANT EXECUTE ON FUNCTION get_signature_dishes() TO anon, authenticated;

-- ============================================================================
-- Step 3: (Optional) Seed some initial order counts for testing
-- Replace these name values with your actual top sellers.
-- ============================================================================

-- UPDATE recipes SET order_count = 420 WHERE lower(name) = 'avocado toast';
-- UPDATE recipes SET order_count = 380 WHERE lower(name) = 'french toast';
-- UPDATE recipes SET order_count = 290 WHERE lower(name) = 'peach ice tea';
-- UPDATE recipes SET order_count = 210 WHERE lower(name) = 'chocolate mousse';

-- ============================================================================
-- Verify: run this after applying to confirm the function works
-- SELECT * FROM get_signature_dishes();
-- ============================================================================
