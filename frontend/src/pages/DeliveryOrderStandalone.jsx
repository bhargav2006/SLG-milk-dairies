import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import accountantService from "../services/accountantService";
import { TableSkeleton } from "../components/common/Skeleton";
import { 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  Navigation,
  Milestone,
  Building
} from "lucide-react";

const DeliveryOrderStandalone = () => {
  const { orderNumber } = useParams();
  const { showError } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const data = await accountantService.getPublicDeliveryDetails(orderNumber);
        setOrder(data.order);
      } catch (err) {
        console.error("Error fetching standalone delivery details:", err);
        showError("Failed to retrieve order details. Please check the URL or contact the accountant.");
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrderDetails();
    }
  }, [orderNumber, showError]);

  if (loading) {
    return (
      <div className="standalone-container skeleton-padding">
        <div className="skeleton-card">
          <TableSkeleton rows={4} cols={3} />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="standalone-container error-center">
        <div className="error-card">
          <AlertCircle className="error-icon" size={64} />
          <h2>Order Not Found</h2>
          <p>The order number <strong>{orderNumber}</strong> does not exist in our system. Please check the link or contact the accountant.</p>
          <a href="/" className="back-home-btn">Go to Homepage</a>
        </div>
      </div>
    );
  }

  // Address Formatting
  const address = order.address;
  const addressText = [
    address.houseNo,
    address.street,
    address.landmark ? `(Near ${address.landmark})` : "",
    address.city,
    address.pincode ? `- ${address.pincode}` : ""
  ].filter(Boolean).join(", ");

  // Google Maps Search link
  const mapLink = address.latitude && address.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${address.latitude},${address.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`;

  // Formatted date
  const orderDate = new Date(order.placedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "Placed": return "status-placed";
      case "Accepted": return "status-accepted";
      case "Assigned": return "status-assigned";
      case "Out for Delivery": return "status-out";
      case "Delivered": return "status-delivered";
      case "Cancelled": return "status-cancelled";
      default: return "status-default";
    }
  };

  return (
    <div className="standalone-page-root">
      <div className="standalone-container">
        
        {/* Branding Header */}
        <header className="brand-header animate-fade-in">
          <div className="logo-wrapper">
            <Building size={24} color="var(--color-primary)" />
            <span className="brand-name">SLG MILK DAIRYS</span>
          </div>
          <span className="standalone-tag">Delivery Partner Hub</span>
        </header>

        {/* Hero Card containing primary status */}
        <div className="hero-card animate-slide-up">
          <div className="hero-info">
            <span className="order-num-label">ORDER ID</span>
            <h3>{order.OrderNumber}</h3>
            <p className="order-time"><Clock size={12} style={{ marginRight: 4 }} /> {orderDate}</p>
          </div>
          <div className={`status-badge ${getStatusClass(order.orderStatus)}`}>
            {order.orderStatus === "Delivered" ? (
              <CheckCircle2 size={16} style={{ marginRight: 6 }} />
            ) : (
              <span className="pulse-dot"></span>
            )}
            {order.orderStatus}
          </div>
        </div>

        {/* Customer Details Block */}
        <section className="section-card animate-slide-up delay-1">
          <h4 className="section-title"><User size={16} /> Customer Contact Details</h4>
          <div className="detail-row highlight-row">
            <div className="label-col">
              <p className="field-label">Customer Name</p>
              <p className="field-value text-bold">{order.customerId?.customerName || "Customer"}</p>
            </div>
            {order.customerId?.customerPhone && (
              <a href={`tel:${order.customerId.customerPhone}`} className="action-circle-btn phone-btn">
                <Phone size={18} />
              </a>
            )}
          </div>

          <div className="detail-row">
            <div className="label-col">
              <p className="field-label">Delivery Address</p>
              <p className="field-value address-value">{addressText}</p>
            </div>
          </div>

          <div className="maps-action-container">
            <a 
              href={mapLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="maps-nav-btn"
            >
              <Navigation size={16} style={{ marginRight: 8 }} /> Navigate using Google Maps
            </a>
          </div>
        </section>

        {/* Accountant/Coordinator details */}
        <section className="section-card animate-slide-up delay-2">
          <h4 className="section-title"><Milestone size={16} /> Accountant / Store Contact</h4>
          <p className="section-instructions">
            Once you reach the location and deliver the order, call the accountant below to verify and close the delivery.
          </p>
          <div className="detail-row highlight-row staff-row">
            <div className="label-col">
              <p className="field-label">Coordinator / Accountant</p>
              <p className="field-value text-bold">{order.accountantId?.name || "Store Accountant"}</p>
              <p className="field-sub">{order.accountantId?.email || "SLG Milk Dairys Store"}</p>
            </div>
            {order.accountantId?.phone ? (
              <a href={`tel:${order.accountantId.phone}`} className="action-circle-btn call-accountant-btn">
                <Phone size={18} />
              </a>
            ) : (
              <span className="field-sub">No direct number added</span>
            )}
          </div>
        </section>

        {/* Assigned Delivery Boy Details */}
        <section className="section-card animate-slide-up delay-2">
          <h4 className="section-title"><Package size={16} /> Delivery Partner Details</h4>
          <div className="detail-row">
            <div className="label-col">
              <p className="field-label">Delivery Person</p>
              {order.isTempDelivery ? (
                <>
                  <p className="field-value text-bold">{order.tempDeliveryBoy?.name || "Temporary Partner"}</p>
                  <p className="field-sub">📞 {order.tempDeliveryBoy?.phone || "N/A"} (Temporary Assignment)</p>
                </>
              ) : (
                <>
                  <p className="field-value text-bold">{order.deliveryBoy?.name || "Permanent Partner"}</p>
                  <p className="field-sub">📞 {order.deliveryBoy?.phone || "N/A"} (Registered Staff)</p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Order Details list */}
        <section className="section-card animate-slide-up delay-3">
          <h4 className="section-title"><Package size={16} /> Ordered Items ({order.products?.length || 0})</h4>
          <div className="items-list">
            {order.products?.map((item, idx) => (
              <div className="item-row" key={idx}>
                <div className="item-info">
                  <span className="item-name">{item.product?.name || "Dairy Product"}</span>
                  <span className="item-qty">Qty: {item.quantity}</span>
                </div>
                <span className="item-price">
                  ₹{((item.product?.retailPrice || item.product?.price || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="summary-box">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{order.subtotal?.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>₹{order.deliveryFee?.toFixed(2)}</span>
            </div>
            <div className="summary-row grand-row">
              <span>Total Amount (Cash on Delivery)</span>
              <span className="grand-price">₹{order.totalAmount?.toFixed(2)}</span>
            </div>
            <div className="payment-tag">
              Payment Method: <strong style={{ color: "var(--color-primary)" }}>{order.paymentMethod || "COD"}</strong>
              {" | "}
              Status: <span className={`pay-status-${order.paymentStatus === "completed" ? "success" : "pending"}`}>
                {order.paymentStatus || "pending"}
              </span>
            </div>
          </div>
        </section>

        {/* Footer info */}
        <footer className="standalone-footer">
          <p>© {new Date().getFullYear()} SLG Milk Dairys. All Rights Reserved.</p>
          <p className="footer-sub">Vibrant, Fresh and Pure Dairy Products delivered directly to you.</p>
        </footer>

      </div>

      <style>{`
        /* Standalone Delivery Details Style System */
        .standalone-page-root {
          background-color: #f6f8fb;
          min-height: 100vh;
          font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
          color: #2D3748;
          padding: 20px 0 40px 0;
        }

        .standalone-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .skeleton-padding {
          padding-top: 100px;
        }

        .skeleton-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        /* Header Styles */
        .brand-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 4px;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }

        .logo-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .brand-name {
          font-weight: 800;
          font-size: 1.15rem;
          color: var(--color-primary, #0066cc);
          letter-spacing: -0.5px;
        }

        .standalone-tag {
          font-size: 0.75rem;
          background: rgba(0, 102, 204, 0.1);
          color: var(--color-primary, #0066cc);
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 600;
        }

        /* Hero Card */
        .hero-card {
          background: linear-gradient(135deg, #1A202C 0%, #2D3748 100%);
          color: #ffffff;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .hero-card::before {
          content: "";
          position: absolute;
          width: 150px;
          height: 150px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 50%;
          top: -50px;
          right: -50px;
        }

        .hero-info h3 {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 4px 0;
          letter-spacing: -0.5px;
        }

        .order-num-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #A0AEC0;
          font-weight: 600;
        }

        .order-time {
          font-size: 0.75rem;
          color: #CBD5E0;
          margin: 0;
          display: flex;
          align-items: center;
        }

        .status-badge {
          display: flex;
          align-items: center;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }

        /* Status Colors */
        .status-placed { background: #E2E8F0; color: #4A5568; }
        .status-accepted { background: #EBF8FF; color: #2B6CB0; }
        .status-assigned { background: #FEFCBF; color: #B7791F; }
        .status-out { background: #EBF4FF; color: #3182CE; }
        .status-delivered { background: #C6F6D5; color: #22543D; }
        .status-cancelled { background: #FED7D7; color: #742A2A; }
        .status-default { background: #EDF2F7; color: #4A5568; }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background-color: currentColor;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.5; }
        }

        /* Cards */
        .section-card {
          background: #ffffff;
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          gap: 12px;
          border: 1px solid rgba(226, 232, 240, 0.6);
        }

        .section-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid #EDF2F7;
          padding-bottom: 8px;
        }

        .section-instructions {
          font-size: 0.8rem;
          color: #4A5568;
          background-color: #FFF5F5;
          border-left: 3px solid #E53E3E;
          padding: 8px 12px;
          border-radius: 4px;
          margin: 0;
          line-height: 1.4;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .highlight-row {
          background-color: #F7FAFC;
          border-radius: 12px;
          padding: 12px;
          border: 1px dashed #E2E8F0;
        }

        .staff-row {
          background-color: #F0F4F8;
          border: 1px dashed #D2D6DC;
        }

        .label-col {
          display: flex;
          flex-direction: column;
        }

        .field-label {
          font-size: 0.75rem;
          color: #A0AEC0;
          text-transform: uppercase;
          margin: 0;
          font-weight: 600;
        }

        .field-value {
          font-size: 0.95rem;
          color: #2D3748;
          margin: 2px 0 0 0;
        }

        .field-sub {
          font-size: 0.75rem;
          color: #718096;
          margin: 2px 0 0 0;
        }

        .text-bold {
          font-weight: 700;
          font-size: 1.05rem;
        }

        .address-value {
          line-height: 1.5;
          color: #4A5568;
        }

        /* Call button */
        .action-circle-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #ffffff;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          text-decoration: none;
        }

        .action-circle-btn:active {
          transform: scale(0.95);
        }

        .phone-btn {
          background-color: #38A169; /* Green for customer phone call */
        }

        .call-accountant-btn {
          background-color: #3182CE; /* Blue for accountant */
        }

        /* Maps Nav Button */
        .maps-action-container {
          margin-top: 4px;
        }

        .maps-nav-btn {
          background-color: #E2E8F0;
          color: #4A5568;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 12px;
          border-radius: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          transition: background-color 0.2s ease, color 0.2s ease;
          border: 1px solid #CBD5E0;
        }

        .maps-nav-btn:active {
          background-color: #CBD5E0;
          color: #2D3748;
        }

        /* Ordered Items Table */
        .items-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 240px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #EDF2F7;
        }

        .item-info {
          display: flex;
          flex-direction: column;
        }

        .item-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #2D3748;
        }

        .item-qty {
          font-size: 0.75rem;
          color: #718096;
        }

        .item-price {
          font-weight: 600;
          font-size: 0.9rem;
        }

        /* Order Summary Box */
        .summary-box {
          background-color: #F7FAFC;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
          border: 1px solid #EDF2F7;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #4A5568;
        }

        .grand-row {
          font-weight: 800;
          color: #1A202C;
          border-top: 1px solid #E2E8F0;
          padding-top: 8px;
          font-size: 0.95rem;
        }

        .grand-price {
          color: #2D3748;
          font-size: 1.15rem;
        }

        .payment-tag {
          font-size: 0.75rem;
          color: #718096;
          text-align: center;
          margin-top: 6px;
          border-top: 1px dashed #E2E8F0;
          padding-top: 8px;
        }

        .pay-status-success {
          color: #38A169;
          font-weight: 700;
          text-transform: uppercase;
        }

        .pay-status-pending {
          color: #DD6B20;
          font-weight: 700;
          text-transform: uppercase;
        }

        /* Footer */
        .standalone-footer {
          text-align: center;
          padding: 20px 10px;
          margin-top: 10px;
        }

        .standalone-footer p {
          font-size: 0.75rem;
          color: #A0AEC0;
          margin: 4px 0;
        }

        .standalone-footer .footer-sub {
          font-size: 0.7rem;
          font-style: italic;
          color: #CBD5E0;
        }

        /* Error States */
        .error-center {
          padding-top: 120px;
          text-align: center;
        }

        .error-card {
          background: white;
          border-radius: 18px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .error-icon {
          color: #E53E3E;
        }

        .error-card h2 {
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0;
        }

        .error-card p {
          font-size: 0.9rem;
          color: #718096;
          line-height: 1.5;
        }

        .back-home-btn {
          margin-top: 8px;
          background-color: var(--color-primary, #0066cc);
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 10px 20px;
          border-radius: 8px;
          text-decoration: none;
        }

        /* Animations */
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.4s ease-out forwards;
          opacity: 0;
        }

        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DeliveryOrderStandalone;
