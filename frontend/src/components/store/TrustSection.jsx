import React from "react";
import { Shield, Award, Truck, CheckCircle } from "lucide-react";

const TrustSection = () => {
  return (
    <section className="lp-trust-section lp-section-padding lp-bg-light">
      <div className="lp-container">
        <div className="lp-trust-grid">
          <div className="lp-trust-card">
            <span className="lp-trust-icon">🛡️</span>
            <h4>100% Fresh & Authentic</h4>
            <p>Guaranteed genuine Visakha Dairy partner distribution.</p>
          </div>

          <div className="lp-trust-card">
            <span className="lp-trust-icon">⚡</span>
            <h4>Fast Delivery</h4>
            <p>Cold-chain delivery direct to your home within hours.</p>
          </div>

          <div className="lp-trust-card">
            <span className="lp-trust-icon">💵</span>
            <h4>Cash on Delivery</h4>
            <p>No prepayment needed. Pay via cash or UPI at delivery.</p>
          </div>

          <div className="lp-trust-card">
            <span className="lp-trust-icon">🏆</span>
            <h4>Trusted Since 2005</h4>
            <p>Over 20 years serving purity across P. Gannavaram & East Godavari.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
