import React from "react";
import { Info, Gift } from "lucide-react";

const OfferBanner = ({ minOrderAmount, freeDeliveryAmount, businessHours, deliveryTodayCutoff }) => {
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
              <span className="lp-info-desc">{businessHours || "10:00 AM - 8:00 PM"}</span>
            </div>
          </div>
        </div>

        {/* Offers Section */}
        <div className="lp-offers-highlights">
          <h3 className="lp-offers-section-title">
            <Gift size={18} className="lp-gift-icon" /> Today's Offers
          </h3>
          
          {/* We show "Offers Coming Soon" as a beautiful placeholder banner */}
          <div className="lp-offer-card-placeholder">
            <span className="lp-confetti-emoji">🎉</span>
            <div className="lp-placeholder-texts">
              <h4>Exclusive Offers Coming Soon</h4>
              <p>We are preparing special discounts and subscription benefits for Narasapuram residents.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferBanner;
