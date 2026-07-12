import React from "react";
import { ShoppingCart, ArrowRight } from "lucide-react";

const FloatingCart = ({ cartCount, cartTotal, setIsCartOpen }) => {
  if (cartCount === 0) return null;

  return (
    <div className="lp-floating-cart-bar lp-fade-in" onClick={() => setIsCartOpen(true)}>
      <div className="lp-floating-cart-content">
        <div className="floating-cart-summary">
          <div className="floating-cart-icon-text">
            <ShoppingCart size={18} />
            <span className="item-count">
              {cartCount} {cartCount === 1 ? "Item" : "Items"}
            </span>
          </div>
          <span className="separator">|</span>
          <span className="price-total">₹{cartTotal}</span>
        </div>
        <button className="view-cart-btn-floating">
          View Cart <ArrowRight size={16} style={{ marginLeft: "4px" }} />
        </button>
      </div>
    </div>
  );
};

export default FloatingCart;
