import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Lock,
  FileText,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Clock,
  Database,
  UserCheck,
  Scale
} from "lucide-react";
import "./TermsOfService.css";

const TermsOfService = () => {
  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = "June 23, 2026";
  const verifiedPhones = ["+91 85000 05377", "+91 99666 75377", "+91 85009 35377"];
  const officialEmail = "yerramsettidurgarao435@gmail.com";

  return (
    <div className="terms-page-container">
      {/* Header bar */}
      <header className="terms-header-nav">
        <div className="terms-brand">
          <img src="/logo.png" alt="SRI LAKSHMI GANAPATI MILKS VISAKHA DAIRY Logo" className="terms-logo" />
          <div className="terms-brand-text">
            <span className="terms-brand-name">SRI LAKSHMI GANAPATI MILKS VISAKHA DAIRY</span>
            <span className="terms-brand-sub">VISAKHA DAIRY PARTNER</span>
          </div>
        </div>
        <div className="terms-nav-links">
          <Link to="/" className="terms-nav-link-btn">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main card wrapper */}
      <main className="terms-card-wrapper">
        <section className="terms-hero-banner">
          <div className="terms-hero-icon">
            <Scale size={48} />
          </div>
          <h1 className="terms-hero-title">Terms of Service</h1>
          <p className="terms-hero-desc">
            Please read these Terms of Service carefully. These terms govern your access to and use of the SRI LAKSHMI GANAPATI MILKS VISAKHA DAIRY website, online billing portal, and wholesale supply services.
          </p>
          <div className="terms-updated-badge">
            <Clock size={14} /> Last Updated: {lastUpdated}
          </div>
        </section>

        {/* Content sections */}
        <div className="terms-content-grid">
          <div className="terms-sidebar">
            <nav className="terms-toc">
              <h3>Table of Contents</h3>
              <ul>
                <li><a href="#acceptance">1. Terms & Acceptance</a></li>
                <li><a href="#eligibility">2. Services & Eligibility</a></li>
                <li><a href="#orders">3. Orders & Fulfillment</a></li>
                <li><a href="#billing">4. Pricing & Payments</a></li>
                <li><a href="#accounts">5. Accounts & Portal Use</a></li>
                <li><a href="#property">6. Intellectual Property</a></li>
                <li><a href="#liability">7. Limitation of Liability</a></li>
                <li><a href="#law">8. Governing Law</a></li>
                <li><a href="#contact">9. Contact Information</a></li>
              </ul>
            </nav>
            <div className="terms-quick-contact">
              <h4>Questions?</h4>
              <p>For any queries regarding these terms, reach our support email:</p>
              <a href={`mailto:${officialEmail}`} className="terms-quick-email">
                <Mail size={14} /> {officialEmail}
              </a>
            </div>
          </div>

          <div className="terms-main-content">
            <section id="acceptance" className="terms-section">
              <h2>1. Terms & Acceptance</h2>
              <p>
                <strong>SRI LAKSHMI GANAPATI MILKS VISAKHA DAIRY</strong> ("we", "us", or "our") operates this website and the integrated billing management portal. We are a registered Micro Enterprise (Udyam Registration: <strong>UDYAM-AP-03-0012683</strong>) and an authorized distribution partner of <strong>Visakha Dairy</strong> based in East Godavari, Andhra Pradesh, India.
              </p>
              <p>
                By accessing our website, registering an account on our billing portal, or placing orders through our wholesale channels, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our website, services, or billing portal.
              </p>
            </section>

            <section id="eligibility" className="terms-section">
              <h2>2. Services & Eligibility</h2>
              <p>
                Our services comprise the wholesale distribution and retail sale of Visakha Dairy products (including Milk, Curd, Ghee, Sweets, and Cool Drinks) and the provision of a billing management portal for our administrative team, accountants, and wholesale partners.
              </p>
              <p>
                To use the billing portal or request a wholesale partner account, you must be a registered retailer, hospitality operator, commercial partner, or authorized administrative agent representing a legitimate business entity in India.
              </p>
            </section>

            <section id="orders" className="terms-section">
              <h2>3. Orders & Fulfillment</h2>
              <p>
                For our wholesale partners, daily delivery logistics are subject to strict cold-chain requirements:
              </p>
              <ul>
                <li><strong>Order Cutoff:</strong> All wholesale orders or modifications must be submitted within the established cutoff times to guarantee morning delivery.</li>
                <li><strong>Logistics & Cold-chain:</strong> We strive to maintain dairy supply lines below 4°C during distribution. Partners must ensure that they have adequate cooling equipment ready to receive the products upon delivery.</li>
                <li><strong>Product Availability:</strong> Stock is subject to supply quotas from Visakha Dairy. In cases of sudden cooperative shortages, we will prioritize long-term partners or issue outstanding credit adjustments.</li>
              </ul>
            </section>

            <section id="billing" className="terms-section">
              <h2>4. Pricing & Payments</h2>
              <p>
                We process billing logs and invoices through our digital POS billing terminal:
              </p>
              <div className="terms-info-boxes">
                <div className="terms-info-box">
                  <div className="info-box-header">
                    <FileText size={18} />
                    <h4>Pricing & Rates</h4>
                  </div>
                  <p>Prices for Visakha Dairy products are determined in accordance with cooperative rate guides and are subject to change without prior notice. Wholesale margins are pre-negotiated and governed by standard distribution contracts.</p>
                </div>

                <div className="terms-info-box">
                  <div className="info-box-header">
                    <Database size={18} />
                    <h4>Invoices & Digital Receipts</h4>
                  </div>
                  <p>Every transaction will generate a digital receipt. Partners are responsible for verifying their invoice statements, outstanding balances, and payment terms periodically through the portal.</p>
                </div>

                <div className="terms-info-box">
                  <div className="info-box-header">
                    <ShieldAlert size={18} />
                    <h4>Dues & Outstanding Balances</h4>
                  </div>
                  <p>Payments must be cleared in accordance with agreed credit cycles. Delayed payments may lead to suspension of morning supply routes and portal account restrictions.</p>
                </div>
              </div>
            </section>

            <section id="accounts" className="terms-section">
              <h2>5. Accounts & Portal Use</h2>
              <p>
                Access to our internal accounting, customer inventory directories, and billing dashboard is strictly restricted:
              </p>
              <ul>
                <li><strong>Authorized Personnel Only:</strong> Only registered administrators, accountants, and staff members are authorized to access the billing dashboard.</li>
                <li><strong>Account Security:</strong> You are responsible for safeguarding your login credentials. Any activity conducted through your account will be deemed your responsibility.</li>
                <li><strong>Prohibited Actions:</strong> You agree not to exploit the billing API, attempt to bypass access rules, use scraping tools on customer lists, or introduce malicious files into our portal infrastructure.</li>
              </ul>
            </section>

            <section id="property" className="terms-section">
              <h2>6. Intellectual Property</h2>
              <p>
                All proprietary software, billing designs, database schemas, text, and graphics on this portal are the intellectual property of <strong>SRI LAKSHMI GANAPATI MILKS VISAKHA DAIRY</strong>.
              </p>
              <p>
                Trademarks, product brands, and logos relating to <strong>Visakha Dairy</strong> (Sri Vijaya Visakha District Milk Producers Mutually Aided Cooperative Union Ltd.) are the exclusive property of the cooperative union and are used herein under partner distribution authorizations.
              </p>
            </section>

            <section id="liability" className="terms-section">
              <h2>7. Limitation of Liability</h2>
              <p>
                While we strive for absolute accuracy in digital records and inventory levels:
              </p>
              <ul>
                <li>Our portal, billing services, and supply logistics are provided on an "as-is" and "as-available" basis without any express or implied warranties.</li>
                <li>We shall not be liable for delivery delays arising from extreme weather, vehicle breakdowns, union strikes, cooperative milk production shortfalls, or power outages affecting cold storage.</li>
                <li>In no event shall our total liability for any claim exceed the invoice value of the specific order in question.</li>
              </ul>
            </section>

            <section id="law" className="terms-section">
              <h2>8. Governing Law</h2>
              <p>
                These Terms of Service and any transactional disputes related to our products or billing portal shall be governed by and construed in accordance with the laws of the State of Andhra Pradesh and the federal laws of India. Any legal proceedings shall be subject to the exclusive jurisdiction of the competent courts of East Godavari district, Andhra Pradesh, India.
              </p>
            </section>

            <section id="contact" className="terms-section terms-contact-block">
              <h2>9. Contact Information</h2>
              <p>If you have any questions or require administrative clarifications regarding these Terms of Service, please contact us:</p>
              
              <div className="terms-contact-details">
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
      <footer className="terms-footer">
        <p>&copy; 2026 SRI LAKSHMI GANAPATI MILKS VISAKHA DAIRY. All Rights Reserved.</p>
        <p className="terms-footer-sub">Partnered with Visakha Dairy Cooperative Union.</p>
      </footer>
    </div>
  );
};

export default TermsOfService;
