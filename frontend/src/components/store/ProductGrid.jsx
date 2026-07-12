import React from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({
  loadingProducts,
  filteredProducts,
  getProductQtyInCart,
  addToCart,
  updateCartQty,
  getProductImage,
  onProductClick,
}) => {
  if (loadingProducts) {
    return (
      <div className="lp-grid lp-storefront-grid-loading">
        {/* Render 4 loading skeleton cards */}
        {[1, 2, 3, 4].map((i) => (
          <div className="lp-skeleton-card" key={i}>
            <div className="lp-skeleton-image shimmer"></div>
            <div className="lp-skeleton-content">
              <div className="lp-skeleton-title shimmer"></div>
              <div className="lp-skeleton-badge shimmer"></div>
              <div className="lp-skeleton-price-row">
                <div className="lp-skeleton-price shimmer"></div>
                <div className="lp-skeleton-btn shimmer"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="lp-storefront-empty">
        <span className="lp-empty-emoji">🥛</span>
        <h4>No Products Found</h4>
        <p>Try searching for another name or category.</p>
      </div>
    );
  }

  return (
    <div className="lp-grid lp-storefront-grid">
      {filteredProducts.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          cartQty={getProductQtyInCart(product._id)}
          addToCart={addToCart}
          updateCartQty={updateCartQty}
          getProductImage={getProductImage}
          onImageClick={onProductClick}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
