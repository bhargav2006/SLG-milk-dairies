import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Lock,
  FileText,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Clock,
  Database,
  UserCheck
} from "lucide-react";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = "June 23, 2026";
  const verifiedPhones = ["+91 85000 05377", "+91 99666 75377", "+91 85009 35377"];
  const officialEmail = "yerramsettidurgarao435@gmail.com";

  return (
    <div className="privacy-page-container">
      {/* Header bar */}
      <header className="privacy-header-nav">
        <div className="privacy-brand">
          <img src="/logo.png" alt="SRI LAKSHMI GANAPATI MILKS VISAKHA DAIRY Logo" className="privacy-logo" />
          <div className="privacy-brand-text">
            <span className="privacy-brand-name">SRI LAKSHMI GANAPATI MILKS VISAKHA DAIRY</span>
            <span className="privacy-brand-sub">VISAKHA DAIRY PARTNER</span>
          </div>
        </div>
        <div className="privacy-nav-links">
          <Link to="/" className="privacy-nav-link-btn">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main card wrapper */}
      <main className="privacy-card-wrapper">
        <section className="privacy-hero-banner">
          <div className="privacy-hero-icon">
            <Shield size={48} />
          </div>
          <h1 className="privacy-hero-title">Privacy Policy</h1>
          <p className="privacy-hero-desc">
            We value your trust. This Privacy Policy explains how SRI LAKSHMI GANAPATI MILKS VISAKHA DAIRY collects, uses, and safeguards information when you visit our website, use our billing portal, or contact us.
          </p>
          <div className="privacy-updated-badge">
            <Clock size={14} /> Last Updated: {lastUpdated}
          </div>
        </section>

        {/* Content sections */}
        <div className="privacy-content-grid">
          <div className="privacy-sidebar">
            <nav className="privacy-toc">
              <h3>Table of Contents</h3>
              <ul>
                <li><a href="#introduction">1. Introduction & Scope</a></li>
                <li><a href="#information-collection">2. Information We Collect</a></li>
                <li><a href="#how-we-use">3. How We Use Your Info</a></li>
                <li><a href="#data-sharing">4. Data Sharing & Partners</a></li>
                <li><a href="#security">5. Storage & Security</a></li>
                <li><a href="#your-rights">6. Your Rights</a></li>
                <li><a href="#contact">7. Contact Information</a></li>
              </ul>
            </nav>
            <div className="privacy-quick-contact">
              <h4>Questions?</h4>
              <p>For any queries regarding this policy, reach our support email:</p>
              <a href={`mailto:${officialEmail}`} className="privacy-quick-email">
                <Mail size={14} /> {officialEmail}
              </a>
            </div>
          </div>

          <div className="privacy-main-content">
            <section id="introduction" className="privacy-section">
              <h2>1. Introduction & Scope</h2>
              <p>
                <strong>SRI LAKSHMI GANAPATI MILKS VISAKHA DAIRY</strong> ("we", "us", or "our") operates the website and billing management portal. We are a registered Micro Enterprise (Udyam Registration: <strong>UDYAM-AP-03-0012683</strong>) and an authorized distribution partner of <strong>Visakha Dairy</strong> based in East Godavari, Andhra Pradesh, India.
              </p>
              <p>
                This policy applies to information collected through our public website, contact forms, and billing portals used by our wholesale partners, accountants, and administrators. By interacting with our services, you consent to the data practices described in this policy.
              </p>
            </section>

            <section id="information-collection" className="privacy-section">
              <h2>2. Information We Collect</h2>
              <p>We may collect information from you in the following ways depending on your interaction with our portal:</p>
              
              <div className="privacy-info-boxes">
                <div className="privacy-info-box">
                  <div className="info-box-header">
                    <FileText size={18} />
                    <h4>Public Inquiries (Contact Form)</h4>
                  </div>
                  <p>When you submit a contact request on our landing page, we collect:</p>
                  <ul>
                    <li>Full Name</li>
                    <li>Phone Number</li>
                    <li>Email Address</li>
                    <li>Subject of inquiry (e.g. Wholesale Supply, Events Booking)</li>
                    <li>Details of your message</li>
                  </ul>
                </div>

                <div className="privacy-info-box">
                  <div className="info-box-header">
                    <Lock size={18} />
                    <h4>Portal Credentials</h4>
                  </div>
                  <p>For authorized administrators, accountants, and staff members, we store:</p>
                  <ul>
                    <li>Registered Username and Email</li>
                    <li>Encrypted Password hashes</li>
                    <li>Assigned System Role (Admin / Accountant)</li>
                  </ul>
                </div>

                <div className="privacy-info-box">
                  <div className="info-box-header">
                    <Database size={18} />
                    <h4>Billing & Transactions</h4>
                  </div>
                  <p>To run our wholesale distribution operations efficiently, our system logs:</p>
                  <ul>
                    <li>Customer and Retail client names</li>
                    <li>Billing and delivery location details</li>
                    <li>Invoice records, product orders (Milk, Curd, Ghee, Sweets)</li>
                    <li>Payment status and outstanding dues summaries</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="how-we-use" className="privacy-section">
              <h2>3. How We Use Your Info</h2>
              <p>We process your information to fulfill our business operations and maintain legal transparency:</p>
              <ul>
                <li><strong>Logistics & Supply:</strong> To schedule morning cold-chain delivery of Visakha Dairy products to your physical locations.</li>
                <li><strong>Billing & Accounting:</strong> To generate digital invoices (retail & wholesale receipts), manage payment books, and track sales performance.</li>
                <li><strong>Communication:</strong> To answer wholesale supply queries, event catering requests, or partner registration inquiries.</li>
                <li><strong>Security & Portal Access:</strong> To prevent unauthorized entry to our inventory management dashboard.</li>
                <li><strong>Compliance & Verification:</strong> To fulfill audit regulations, GST guidelines, and platform verification protocols (such as Meta Business Manager credentials).</li>
              </ul>
            </section>

            <section id="data-sharing" className="privacy-section">
              <h2>4. Data Sharing & Partners</h2>
              <p>
                As a premium partner of <strong>Visakha Dairy Co-operative Union</strong>, transactional data relating to cooperative supply, logistics, or quality assurance may be cross-verified with official Visakha Dairy records.
              </p>
              <p>
                We do not sell, trade, or rent your personal identification information to third parties. We do not use third-party behavioral tracking or advertising services.
              </p>
            </section>

            <section id="security" className="privacy-section">
              <h2>5. Storage & Security</h2>
              <p>
                We adopt appropriate data collection, storage, and processing practices and security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information, username, password, transaction information, and billing logs.
              </p>
              <p>
                All account passwords are encrypted using secure cryptographic hashing algorithms. Internal dashboards are restricted solely to authenticated staff members with explicitly assigned roles.
              </p>
            </section>

            <section id="your-rights" className="privacy-section">
              <h2>6. Your Rights</h2>
              <p>Depending on your relationship with us, you have rights regarding your information:</p>
              <ul>
                <li><strong>Access & Correction:</strong> Retailers and portal users can request a copy of their transaction statements or update their billing information.</li>
                <li><strong>Account Deletion:</strong> Registered staff or administrators can request their account removal, subject to statutory business bookkeeping and tax laws.</li>
              </ul>
            </section>

            <section id="contact" className="privacy-section privacy-contact-block">
              <h2>7. Contact Information</h2>
              <p>If you have any questions about this Privacy Policy, please contact our authorized administrator:</p>
              
              <div className="privacy-contact-details">
                <div className="contact-item">
                  <UserCheck size={18} />
                  <div>
                    <strong>Legal Business Profile:</strong>
                    <p>SRI LAKSHMI GANAPATI MILKS VISAKHA DAIRY</p>
                  </div>
                </div>

                <div className="contact-item">
                  <MapPin size={18} />
                  <div>
                    <strong>Registered Address:</strong>
                    <p>D NO 5-57/3, Main Road, Patha Gannavaram, P.Gannavaram, East Godavari District, Andhra Pradesh - 533240, India</p>
                  </div>
                </div>

                <div className="contact-item">
                  <Mail size={18} />
                  <div>
                    <strong>Official Email:</strong>
                    <p><a href={`mailto:${officialEmail}`}>{officialEmail}</a></p>
                  </div>
                </div>

                <div className="contact-item">
                  <Phone size={18} />
                  <div>
                    <strong>Verified Business Contact Support:</strong>
                    <div className="contact-phones-list">
                      {verifiedPhones.map((phone, i) => (
                        <a key={i} href={`tel:${phone.replace(/\s+/g, "")}`} className="contact-phone-link">
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="privacy-footer">
        <p>&copy; 2026 SRI LAKSHMI GANAPATI MILKS VISAKHA DAIRY. All Rights Reserved.</p>
        <p className="privacy-footer-sub">Partnered with Visakha Dairy Cooperative Union.</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
