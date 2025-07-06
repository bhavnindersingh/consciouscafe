import React from "react";
import ProductCard from "./ProductCard";

const DrinksMenuPage = ({ products, onAddToCart, onProductClick }) => {
  // Filter products to show only drinks categories
  const drinkCategories = ["beverages", "coffee", "tea", "smoothies", "juices"];

  const drinkProducts = products.filter((product) =>
    drinkCategories.some(
      (category) =>
        product.category?.toLowerCase().includes(category) ||
        product.name?.toLowerCase().includes("coffee") ||
        product.name?.toLowerCase().includes("tea") ||
        product.name?.toLowerCase().includes("juice") ||
        product.name?.toLowerCase().includes("smoothie"),
    ),
  );

  return (
    <div className="drinks-menu-page">
      <div className="page-header">
        <h1>Drinks Menu</h1>
        <p>Refreshing beverages to complement your meal</p>
      </div>

      <div className="drinks-grid">
        {drinkProducts.length > 0 ? (
          drinkProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onProductClick={onProductClick}
            />
          ))
        ) : (
          <div className="no-drinks">
            <h3>Coming Soon!</h3>
            <p>
              Our drinks menu is being prepared. Check back soon for refreshing
              options.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrinksMenuPage;
