import React from "react";

const Hero = () => {
  return (
    <section
      id="home"
      className="lp-hero-section-compact"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.7) 100%), url('/hero_bg.png')",
      }}
    >
      <div className="lp-container lp-hero-compact-container">
        <div className="lp-hero-compact-content">
          <h1 className="lp-hero-compact-title">
            Fresh Dairy Delivered to Your Doorstep
          </h1>
          <p className="lp-hero-compact-subtitle">
            Fresh Milk, Curd, Butter, Ice Cream & More
          </p>

          <div className="lp-hero-compact-perks">
            <span className="lp-perk-badge">🚚 Same Day Delivery</span>
            <span className="lp-perk-badge">💵 Cash on Delivery</span>
            <span className="lp-perk-badge">⭐ Trusted Visakha Dairy Partner</span>
          </div>

          <div className="lp-hero-compact-actions">
            <a href="#products" className="lp-btn lp-btn-primary lp-btn-hero">
              Order Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
