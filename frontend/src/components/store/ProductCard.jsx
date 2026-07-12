import React from "react";
import { ShoppingCart, Plus, Minus, CheckCircle, AlertTriangle } from "lucide-react";

const ProductCard = React.memo(({
  product,
  cartQty,
  addToCart,
  updateCartQty,
  getProductImage,
  onImageClick,
}) => {
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 10;
  const retailPrice = product.retailPrice || product.price || 0;

  // Extract size/unit if present in name or default to packet/piece
  const getSizeLabel = () => {
    const match = product.name.match(/(\d+\s*(?:ml|g|kg|l|liters|packets))/i);
    return match ? match[1] : null;
  };

  const sizeLabel = getSizeLabel();

  // Price label format: e.g. "₹40 / 500ml" or "₹40"
  const getFormattedPrice = () => {
    if (sizeLabel) {
      return (
        <span className="price-val">
          ₹{retailPrice} <span className="price-unit">/ {sizeLabel}</span>
        </span>
      );
    }
    return <span className="price-val">₹{retailPrice}</span>;
  };

  return (
    <div className={`lp-product-item-card lp-store-card ${isOutOfStock ? "out-of-stock" : ""}`}>
      {/* Product Image Wrapper - clicking opens Details modal */}
      <div className="lp-p-img-box" onClick={() => onImageClick(product)}>
        {product.category && <div className="lp-p-category">{product.category}</div>}
        
        {/* Badge Labels if backend provides them (placeholders for New/Trending/Best Seller if data model extends) */}
        {product.tags && product.tags.map((tag, i) => (
          <span key={i} className={`lp-p-tag-badge ${tag.toLowerCase()}`}>{tag}</span>
        ))}
        
        <img
          src={getProductImage(product)}
          alt={product.name}
          onError={(e) => {
            e.target.src = `${import.meta.env.VITE_BACKEND_URI}/uploads/defaults/Logo.jpg`;
          }}
          loading="lazy"
          className="lp-store-product-img"
        />
        {isOutOfStock && <div className="out-of-stock-overlay">Out of Stock</div>}
      </div>

      <div className="lp-p-details">
        {/* Product Name */}
        <h4 className="lp-product-card-title" onClick={() => onImageClick(product)}>
          {product.name}
        </h4>

        {/* Size Label */}
        {sizeLabel && <span className="lp-product-size">{sizeLabel}</span>}

        {/* Review rating (only shown if ratings provided by backend) */}
        {product.ratings && product.ratingsCount > 0 && (
          <div className="lp-product-rating">
            <span className="stars">⭐ {product.ratings}</span>
            <span className="count">({product.ratingsCount} reviews)</span>
          </div>
        )}

        {/* Stock Status Indicator */}
        <div className="lp-stock-indicator">
          {isOutOfStock ? (
            <span className="lp-stock-status out">
              <span className="dot"></span> ❌ Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="lp-stock-status low">
              <span className="dot"></span> ⚠ Only {product.stock} Left
            </span>
          ) : (
            <span className="lp-stock-status in">
              <span className="dot"></span> ✅ In Stock
            </span>
          )}
        </div>

        {/* Price and Add Action Bar */}
        <div className="lp-store-price-action">
          <div className="lp-price-box">
            {getFormattedPrice()}
          </div>

          <div className="lp-action-btn-wrapper">
            {isOutOfStock ? (
              <button className="lp-btn lp-btn-disabled" disabled>
                Unavailable
              </button>
            ) : cartQty > 0 ? (
              <div className="lp-quantity-selector">
                <button onClick={() => updateCartQty(product._id, -1)} className="qty-btn" aria-label="Decrease quantity">
                  <Minus size={14} />
                </button>
                <span className="qty-val">{cartQty}</span>
                <button onClick={() => updateCartQty(product._id, 1)} className="qty-btn" aria-label="Increase quantity">
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product)}
                className="lp-btn lp-btn-store-add"
                aria-label="Add to cart"
              >
                <Plus size={14} style={{ marginRight: "2px" }} /> Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
