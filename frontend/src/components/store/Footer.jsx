import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Footer = ({ businessHours }) => {
  return (
    <footer id="footer" className="lp-main-footer">
      <div className="lp-container lp-footer-grid">
        {/* Brand Block */}
        <div className="lp-footer-brand-col">
          <div className="lp-footer-logo-row">
            <img src="/logo.png" alt="SLG Logo" className="lp-footer-logo-img" />
            <div className="lp-footer-brand-text">
              <h4>SRI LAKSHMI GANAPATHI</h4>
              <span className="lp-footer-brand-sub" style={{ fontSize: "0.68rem", color: "var(--lp-secondary)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", display: "block" }}>Visakha Dairy Partner</span>
            </div>
          </div>
          <p className="lp-brand-tagline">
            Authorized Visakha Dairy Partner since 2005. Sourcing, cooling, and supplying premium fresh dairy across P. Gannavaram.
          </p>
          <div className="lp-business-hours-box">
            <Clock size={16} />
            <span>
              <strong>Hours:</strong> {businessHours || "8:00 AM - 7:00 PM"} Daily
            </span>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="lp-footer-col">
          <h5>Quick Links</h5>
          <ul className="lp-footer-links-list">
            <li>
              <a href="#products">Store Catalog</a>
            </li>
            <li>
              <Link to="/about">About Us & Profile</Link>
            </li>
            <li>
              <Link to="/about#business-details">Registration Profile</Link>
            </li>
            <li>
              <Link to="/about#services">Our Services</Link>
            </li>
            <li>
              <Link to="/about#faq">FAQs</Link>
            </li>
          </ul>
        </div>

        {/* Policies Column */}
        <div className="lp-footer-col">
          <h5>Policies</h5>
          <ul className="lp-footer-links-list">
            <li>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms-of-service">Terms & Conditions</Link>
            </li>
            <li>
              <Link to="/refund-policy">Refund Policy</Link>
            </li>
          </ul>
        </div>

        {/* Our Promise Column */}
        <div className="lp-footer-col">
          <h5>Our Promise</h5>
          <ul className="lp-footer-links-list" style={{ color: "var(--lp-text-muted)", fontSize: "0.82rem", gap: "10px" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "var(--lp-success)" }}>✓</span> 100% Pure Milk
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "var(--lp-success)" }}>✓</span> Chilled Delivery
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "var(--lp-success)" }}>✓</span> No Preservatives
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "var(--lp-success)" }}>✓</span> Hygienic Sourcing
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "var(--lp-success)" }}>✓</span> Visakha Partner
            </li>
          </ul>
        </div>

        {/* Contacts Column */}
        <div className="lp-footer-col">
          <h5>Contact Us</h5>
          <div className="lp-footer-contact-details">
            <div className="contact-line">
              <Phone size={16} />
              <div className="contact-texts">
                <a href="tel:+919966675377">+91 99666 75377</a>
                <a href="tel:+918500935377">+91 85009 35377</a>
              </div>
            </div>
            <div className="contact-line">
              <span className="whatsapp-icon">💬</span>
              <a
                href="https://wa.me/919966675377"
                target="_blank"
                rel="noreferrer"
                className="whatsapp-link-btn"
              >
                Chat on WhatsApp
              </a>
            </div>
            <div className="contact-line">
              <MapPin size={16} />
              <a
                href="https://maps.google.com/?q=Patha+Gannavaram,P.Gannavaram"
                target="_blank"
                rel="noreferrer"
                className="map-link-btn"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom copyright bar */}
      <div className="lp-footer-bottom">
        <div className="lp-container lp-footer-bottom-flex">
          <p>&copy; {new Date().getFullYear()} SRI LAKSHMI GANAPATHI MILK DAIRYS. All rights reserved.</p>
          <p className="coop-declaration">
            Partnered with Sri Vijaya Visakha District Milk Producers Co-op Union Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
