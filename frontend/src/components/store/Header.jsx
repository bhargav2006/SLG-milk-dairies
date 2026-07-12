import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, LogOut, Menu, X } from "lucide-react";

const Header = ({
  user,
  customerToken,
  cartCount,
  handleCustomerLogout,
  setIsCartOpen,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="lp-main-header">
      <div className="lp-container lp-nav-container">
        <a href="/" className="lp-brand-logo">
          <img src="/logo.png" alt="SLG Logo" className="lp-logo-img" />
          <div className="lp-brand-text">
            <span className="lp-brand-name">SRI LAKSHMI GANAPATHI</span>
            <span className="lp-brand-sub">VISAKHA DAIRY PARTNER</span>
          </div>
        </a>

        <nav className={`lp-nav-menu ${menuOpen ? "open" : ""}`}>
          <a href="#products" className="lp-nav-link" onClick={() => setMenuOpen(false)}>
            Products
          </a>
          <Link
            to="/track-orders"
            onClick={() => setMenuOpen(false)}
            className="lp-nav-link"
          >
            Track Orders
          </Link>
          <Link to="/about" className="lp-nav-link" onClick={() => setMenuOpen(false)}>
            About
          </Link>
          <a href="#footer" className="lp-nav-link" onClick={() => setMenuOpen(false)}>
            Contact
          </a>

          {customerToken && (
            <button
              onClick={() => {
                setMenuOpen(false);
                handleCustomerLogout();
              }}
              className="lp-nav-link lp-logout-btn"
              title="Sign Out"
            >
              <LogOut size={16} style={{ marginRight: "4px" }} /> Logout
            </button>
          )}

          {user ? (
            <Link to="/dashboard" className="lp-btn lp-btn-nav" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="lp-btn lp-btn-nav lp-btn-portal" onClick={() => setMenuOpen(false)}>
              Portal Login
            </Link>
          )}
        </nav>

        <div className="lp-header-actions">
          <button
            onClick={() => setIsCartOpen(true)}
            className="lp-header-cart-btn"
            aria-label="View Cart"
          >
            <div className="lp-cart-icon-wrapper">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="lp-cart-badge-bubble animate-bounce-subtle">
                  {cartCount}
                </span>
              )}
            </div>
          </button>

          <button
            className="lp-mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
