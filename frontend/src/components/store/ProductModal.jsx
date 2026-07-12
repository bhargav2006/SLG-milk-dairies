import React from "react";
import { X, ShoppingCart, Plus, Minus } from "lucide-react";

const ProductModal = ({
  product,
  onClose,
  cartQty,
  addToCart,
  updateCartQty,
  getProductImage,
}) => {
  if (!product) return null;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const retailPrice = product.retailPrice || product.price || 0;

  // Extract size/unit if present in name or default to packet/piece
  const getSizeLabel = () => {
    const match = product.name.match(/(\d+\s*(?:ml|g|kg|l|liters|packets))/i);
    return match ? match[1] : null;
  };

  const sizeLabel = getSizeLabel();

  return (
    <div className="lp-modal-overlay show" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="lp-product-details-modal lp-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={onClose} className="lp-modal-close-btn" aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="lp-p-modal-grid">
          {/* Large Product Image */}
          <div className="lp-p-modal-image-box">
            <img
              src={getProductImage(product)}
              alt={product.name}
              onError={(e) => {
                e.target.src = `${import.meta.env.VITE_BACKEND_URI}/uploads/defaults/Logo.jpg`;
              }}
              className="lp-p-modal-img"
            />
          </div>

          {/* Product Details Content */}
          <div className="lp-p-modal-info">
            {product.category && <span className="lp-modal-category-badge">{product.category}</span>}
            <h3 className="lp-modal-title">{product.name}</h3>

            {sizeLabel && <span className="lp-modal-size-info">{sizeLabel}</span>}

            {/* Price section */}
            <div className="lp-modal-price-box">
              <span className="price-label">Price:</span>
              <span className="price-val">₹{retailPrice}</span>
            </div>

            {/* Placeholder variant selector component - hidden unless backend supplies variant data */}
            {product.variants && product.variants.length > 0 && (
              <div className="lp-modal-variants-section">
                <span className="variants-label">Select Package Size:</span>
                <div className="lp-variants-pills-row">
                  {product.variants.map((variant, i) => (
                    <button key={i} className={`variant-pill ${i === 0 ? "active" : ""}`}>
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed description */}
            <div className="lp-modal-desc-section">
              <h5>Product Description</h5>
              <p>{product.description || "Fresh quality dairy sourced in partnership with Visakha Dairy cooperative unions. Hygienically processed and maintained under cold storage."}</p>
            </div>

            {/* Actions Footer */}
            <div className="lp-modal-actions-footer">
              {isOutOfStock ? (
                <button className="lp-btn lp-btn-disabled" disabled style={{ width: "100%" }}>
                  Currently Out of Stock
                </button>
              ) : cartQty > 0 ? (
                <div className="lp-modal-qty-actions">
                  <span className="qty-heading">Added to Cart:</span>
                  <div className="lp-quantity-selector lg">
                    <button onClick={() => updateCartQty(product._id, -1)} className="qty-btn" aria-label="Decrease quantity">
                      <Minus size={16} />
                    </button>
                    <span className="qty-val">{cartQty}</span>
                    <button onClick={() => updateCartQty(product._id, 1)} className="qty-btn" aria-label="Increase quantity">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    addToCart(product);
                  }}
                  className="lp-btn lp-btn-primary lp-btn-block"
                  style={{ height: "48px" }}
                >
                  <ShoppingCart size={18} style={{ marginRight: "8px" }} /> Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
