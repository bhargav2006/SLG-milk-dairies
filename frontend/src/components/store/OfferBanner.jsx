import React, { useState } from "react";
import { Gift, Tag, Check, Copy } from "lucide-react";

const OfferBanner = ({ minOrderAmount, freeDeliveryAmount, businessHours, deliveryTodayCutoff }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    try {
      navigator.clipboard?.writeText("SLG05");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.log("Failed to copy", e);
    }
  };

  return (
    <div className="lp-offer-banner-container">
      <div className="lp-container">
        {/* Core delivery info bar */}
        <div className="lp-delivery-info-bar">
          <div className="lp-info-item">
            <span className="lp-info-icon">🚚</span>
            <div className="lp-info-texts">
              <span className="lp-info-title">Delivering Today</span>
              <span className="lp-info-desc">Orders before {deliveryTodayCutoff || "7:00 PM"}</span>
            </div>
          </div>

          <div className="lp-info-item">
            <span className="lp-info-icon">💵</span>
            <div className="lp-info-texts">
              <span className="lp-info-title">Cash on Delivery</span>
              <span className="lp-info-desc">Pay at your doorstep</span>
            </div>
          </div>

          <div className="lp-info-item">
            <span className="lp-info-icon">🛒</span>
            <div className="lp-info-texts">
              <span className="lp-info-title">Min. Order ₹{minOrderAmount || 200}</span>
              <span className="lp-info-desc">Free delivery above ₹{freeDeliveryAmount || 500}</span>
            </div>
          </div>

          <div className="lp-info-item">
            <span className="lp-info-icon">🕒</span>
            <div className="lp-info-texts">
              <span className="lp-info-title">Delivery Hours</span>
              <span className="lp-info-desc">{businessHours || "8:00 AM - 7:00 PM"}</span>
            </div>
          </div>
        </div>

        {/* Offers Section */}
        <div className="lp-offers-highlights">
          <h3 className="lp-offers-section-title">
            <Gift size={18} className="lp-gift-icon" /> Today's Special Offers & Coupons
          </h3>
          
          <div className="lp-offer-card-placeholder" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className="lp-confetti-emoji">🎉</span>
              <div className="lp-placeholder-texts">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--lp-primary-dark, #1e3a8a)" }}>
                    Get 5% OFF on your order!
                  </h4>
                  <span style={{ backgroundColor: "#10b981", color: "#ffffff", padding: "2px 8px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
                    Unlimited Uses
                  </span>
                </div>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.83rem", color: "var(--lp-text-secondary, #475569)" }}>
                  Use coupon code <strong style={{ color: "#2563eb", letterSpacing: "0.05em", fontSize: "0.95rem" }}>SLG05</strong> at checkout to get an instant 5% discount on your order.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={handleCopyCode}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#ffffff",
                  color: "#2563eb",
                  border: "2px dashed #2563eb",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                  boxShadow: "0 2px 4px rgba(37, 99, 235, 0.1)",
                  transition: "all 0.2s ease",
                }}
                title="Click to copy coupon code"
              >
                <Tag size={16} />
                <span>SLG05</span>
                {copied ? <Check size={16} style={{ color: "#10b981" }} /> : <Copy size={14} style={{ opacity: 0.7 }} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferBanner;

