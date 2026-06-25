import React from 'react';
import { useParams } from 'react-router-dom';
import FoodMenuPage from './FoodMenuPage';

const CategoryPage = ({ products, onAddToCart, onProductClick, loading, error }) => {
  const { categoryId } = useParams();
  // The category may belong to any group (food / drinks / patisserie). Without
  // telling FoodMenuPage which group, it defaults to the first group and then
  // resets to that group's first category — silently showing the wrong section.
  const match = (products || []).find(p => p.category === categoryId);
  const initialGroup = match?.mainCategory || undefined;
  return (
    <FoodMenuPage
      products={products}
      onAddToCart={onAddToCart}
      onProductClick={onProductClick}
      loading={loading}
      error={error}
      initialGroup={initialGroup}
      initialCat={categoryId}
    />
  );
};

export default CategoryPage;
