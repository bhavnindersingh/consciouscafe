-- ============================================================================
-- CONSCIOUS CAFÉ — Signature Dishes RPC
-- Run this in the Supabase SQL Editor
-- (REACT_APP_SUPABASE_URL — project: hxpbrlqclyujirspuuav)
--
-- No schema changes needed. Reads the existing `sales` column on `recipes`
-- which is already populated by the POS.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_signature_dishes()
RETURNS TABLE (
  id                  bigint,
  name                text,
  description         text,
  selling_price       numeric,
  category            text,
  sub_category        text,
  image_url           text,
  delivery_image_url  text,
  sku                 text,
  tax_rate            numeric,
  sales               integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH ranked AS (
    SELECT
      id, name, description, selling_price,
      category, sub_category,
      image_url, delivery_image_url,
      sku, tax_rate, sales,
      row_number() OVER (
        PARTITION BY category
        ORDER BY sales DESC NULLS LAST, name
      ) AS rn
    FROM recipes
    WHERE is_production_recipe = true
      AND category IN ('Food', 'Drinks', 'Patisserie')
      AND (image_url IS NOT NULL OR delivery_image_url IS NOT NULL)
  )
  SELECT id, name, description, selling_price,
         category, sub_category,
         image_url, delivery_image_url,
         sku, tax_rate, sales
  FROM ranked
  WHERE (category = 'Food'       AND rn <= 2)
     OR (category = 'Drinks'     AND rn  = 1)
     OR (category = 'Patisserie' AND rn  = 1)
  ORDER BY category, rn;
$$;

-- Allow the public (anon) key to call this function
GRANT EXECUTE ON FUNCTION get_signature_dishes() TO anon, authenticated;

-- Verify:
-- SELECT * FROM get_signature_dishes();
