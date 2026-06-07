import React from 'react';
import { useParams } from 'react-router-dom';
import FoodMenuPage from './FoodMenuPage';

const CategoryPage = ({ products, onAddToCart, onProductClick, loading, error }) => {
  const { categoryId } = useParams();
  return (
    <FoodMenuPage
      products={products}
      onAddToCart={onAddToCart}
      onProductClick={onProductClick}
      loading={loading}
      error={error}
      initialCat={categoryId}
    />
  );
};

export default CategoryPage;
