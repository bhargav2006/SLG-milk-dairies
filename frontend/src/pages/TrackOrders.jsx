import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Phone, Trash2, LogOut, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "../context/ToastContext";
import customerService from "../services/customerService";
import "./TrackOrders.css";

const TrackOrders = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();

  // Authentication State
  const [customerToken, setCustomerToken] = useState(() => localStorage.getItem("customer_token") || null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [isRegistered, setIsRegistered] = useState(true);
  const [tempOtp, setTempOtp] = useState(""); // [TESTING ONLY] Temporary OTP placeholder state

  // Orders Log State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active"); // "active" (Placed, Accepted, Assigned, Out for Delivery) vs "past" (Delivered, Cancelled)

  // Send auth OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!customerPhone || customerPhone.length !== 10 || !/^\d+$/.test(customerPhone)) {
      showError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setOtpVerifying(true);
      // [TESTING ONLY] Retrieve response containing the generated OTP
      const res = await customerService.sendOtp(customerPhone);
      setOtpSent(true);

      // Update registration status
      if (res && res.hasOwnProperty("isRegistered")) {
        setIsRegistered(res.isRegistered);
      } else {
        setIsRegistered(true);
      }

      // [TESTING ONLY] Save generated OTP value
      if (res && res.otp) {
        setTempOtp(res.otp);
      }
      showSuccess("OTP sent successfully. Check your mobile verification step!");
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Verify auth OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      showError("Please enter the 6-digit OTP");
      return;
    }

    if (!isRegistered && !customerName.trim()) {
      showError("Please enter your name");
      return;
    }

    try {
      setOtpVerifying(true);
      const data = await customerService.verifyOtp(customerPhone, customerName, otp);
      if (data && data.token) {
        localStorage.setItem("customer_token", data.token);
        localStorage.setItem("customer_info", JSON.stringify(data.customer));
        setCustomerToken(data.token);
        if (data.customer.customerName && data.customer.customerName !== "Anonymous") {
          setCustomerName(data.customer.customerName);
        }
        showSuccess("Authenticated successfully!");
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "OTP verification failed. Check again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Fetch customer orders list
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await customerService.getMyOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      showError("Failed to retrieve your order history.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel Placed Order
  const handleCancelOrder = async (orderNumber) => {
    const confirmCancel = window.confirm(`Are you sure you want to cancel order ${orderNumber}?`);
    if (!confirmCancel) return;
    
    const reason = prompt("Enter cancellation reason (optional):") || "";
    try {
      await customerService.cancelOrder(orderNumber, reason);
      showSuccess(`Order ${orderNumber} cancelled successfully.`);
      fetchOrders(); // reload
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to cancel order.");
    }
  };

  // Customer Logout
  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_info");
    setCustomerToken(null);
    setCustomerPhone("");
    setCustomerName("");
    setOtp("");
    setOtpSent(false);
    setIsRegistered(true);
    setOrders([]);
    showInfo("Logged out of session.");
  };

  useEffect(() => {
    if (customerToken) {
      fetchOrders();
      const savedInfo = localStorage.getItem("customer_info");
      if (savedInfo) {
        const info = JSON.parse(savedInfo);
        if (info.customerName && info.customerName !== "Anonymous") {
          setCustomerName(info.customerName);
        }
      }
    }
  }, [customerToken]);

  // Split active and past history
  const activeOrders = orders.filter(o => ["Placed", "Accepted", "Assigned", "Out for Delivery"].includes(o.orderStatus));
  const pastOrders = orders.filter(o => ["Delivered", "Cancelled"].includes(o.orderStatus));
  const currentOrdersList = activeTab === "active" ? activeOrders : pastOrders;

  return (
    <div className="to-page-root">
      {/* Header bar */}
      <header className="to-header">
        <div className="to-container to-header-flex">
          <Link to="/" className="to-back-shop-btn">
            <ArrowLeft size={18} /> Back to Shop
          </Link>
          <div className="to-brand-title">
            <img src="/logo.png" alt="SLG Logo" className="to-logo-img" />
            <span>Track Orders</span>
          </div>
          {customerToken ? (
            <button onClick={handleLogout} className="to-logout-btn" title="Logout">
              <LogOut size={18} style={{ marginRight: "6px" }} /> Logout
            </button>
          ) : (
            <div style={{ width: "100px" }} />
          )}
        </div>
      </header>

      <main className="to-main-container">
        <div className="to-container">
          {!customerToken ? (
            /* OTP Auth Workspace */
            <div className="to-auth-card lp-fade-in">
              <div className="to-auth-header">
                <h2>Track Your Deliveries</h2>
                <p>Enter your 10-digit mobile phone number to log in and view your active order receipts.</p>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="to-auth-form">
                  <div className="to-form-group">
                    <label htmlFor="trackPhone">Mobile Number</label>
                    <input
                      type="tel"
                      id="trackPhone"
                      placeholder="10-Digit Mobile Number"
                      value={customerPhone}
                      onChange={(e) => setPhoneValue(e.target.value)}
                      maxLength="10"
                      required
                    />
                  </div>
                  <button type="submit" disabled={otpVerifying} className="to-btn-primary">
                    {otpVerifying ? "Sending OTP..." : "Get OTP Code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="to-auth-form">
                  <p className="otp-sent-banner">OTP sent to <strong>+91 {customerPhone}</strong></p>
                  
                  {!isRegistered && (
                    <div className="to-form-group" style={{ marginBottom: "16px" }}>
                      <label htmlFor="trackName">Your Name</label>
                      <input
                        type="text"
                        id="trackName"
                        placeholder="Enter your name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="to-form-group">
                    <label htmlFor="trackOtp">6-Digit Verification Code</label>
                    <input
                      type="text"
                      id="trackOtp"
                      placeholder="Enter 6-Digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength="6"
                      required
                    />
                    {/* [TESTING ONLY] Temporary OTP placeholder printed directly under the field */}
                    {tempOtp && (
                      <div style={{ marginTop: "6px", fontSize: "0.82rem", color: "#d97706", fontWeight: "bold" }}>
                        [TESTING ONLY] Temporary OTP: {tempOtp}
                      </div>
                    )}
                  </div>
                  <button type="submit" disabled={otpVerifying} className="to-btn-primary">
                    {otpVerifying ? "Verifying..." : "Verify & Track Orders"}
                  </button>
                  <button type="button" onClick={() => setOtpSent(false)} className="to-btn-change-phone">
                    Change Mobile Number
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Active Tracking Orders Workspace */
            <div className="to-orders-workspace lp-fade-in">
              <div className="to-workspace-header">
                <div>
                  <h3>Hello, {customerName || "Customer"}!</h3>
                  <p>Here are your orders from Sri Lakshmi Ganapathi Milk Dairys.</p>
                </div>
                <button onClick={fetchOrders} className="to-refresh-btn" disabled={loading}>
                  <RefreshCw size={16} className={loading ? "spin" : ""} style={{ marginRight: "6px" }} /> Refresh Status
                </button>
              </div>

              {/* Tabs Switcher */}
              <div className="to-workspace-tabs">
                <button
                  className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
                  onClick={() => setActiveTab("active")}
                >
                  Active Shipments ({activeOrders.length})
                </button>
                <button
                  className={`tab-btn ${activeTab === "past" ? "active" : ""}`}
                  onClick={() => setActiveTab("past")}
                >
                  Past Deliveries ({pastOrders.length})
                </button>
              </div>

              {loading ? (
                <div className="to-loader">
                  <div className="spinner"></div>
                  <p>Fetching your order receipts...</p>
                </div>
              ) : currentOrdersList.length === 0 ? (
                <div className="to-empty-state">
                  <span className="emoji">🥛</span>
                  <h4>No Orders Found</h4>
                  <p>You do not have any orders listed in this category.</p>
                  <Link to="/" className="to-shop-cta-btn">Start Shopping</Link>
                </div>
              ) : (
                <div className="to-orders-grid">
                  {currentOrdersList.map((ord) => (
                    <div key={ord._id} className="to-order-card">
                      {/* Header details */}
                      <div className="to-card-header">
                        <div className="number-date">
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                            <h4 style={{ margin: 0 }}>{ord.OrderNumber}</h4>
                            {ord.invoiceNumber && (
                              <span style={{ fontSize: "0.82rem", backgroundColor: "rgba(124, 58, 237, 0.12)", color: "rgb(124, 58, 237)", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
                                Invoice: <Link to={`/bill/${ord.invoiceNumber}`} style={{ color: "rgb(124, 58, 237)", textDecoration: "underline" }}>{ord.invoiceNumber}</Link>
                              </span>
                            )}
                          </div>
                          <span className="date">
                            <Clock size={12} style={{ marginRight: "4px" }} />
                            {new Date(ord.placedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        <span className={`status-badge ${ord.orderStatus?.toLowerCase().replace(/\s+/g, "-")}`}>
                          {ord.orderStatus}
                        </span>
                      </div>

                      {/* Items checklist */}
                      <div className="to-card-body">
                        <div className="ord-products-list">
                          {ord.products?.map((item, idx) => (
                            <div key={idx} className="product-item-row">
                              <span>{item.product?.name || "Dairy Product"} (Qty: {item.quantity})</span>
                              <strong>₹{(item.product?.retailPrice || item.product?.price || 0) * item.quantity}</strong>
                            </div>
                          ))}
                        </div>

                        {/* Delivery address */}
                        <div className="ord-address-block">
                          <span className="lbl">Delivery Location</span>
                          <p className="addr-txt">
                            <MapPin size={14} className="pin-icon" />
                            {ord.address.houseNo ? `${ord.address.houseNo}, ` : ""}
                            {ord.address.street}, {ord.address.city} - {ord.address.pincode}
                          </p>
                          {ord.notes && <p className="notes-txt"><strong>Instructions:</strong> "{ord.notes}"</p>}
                        </div>

                        {/* Delivery partner info block */}
                        {ord.deliveryBoy && (
                          <div className="ord-delivery-boy-block">
                            <span className="lbl">🛵 Delivery Partner Assigned:</span>
                            <div className="boy-details">
                              <span><strong>{ord.deliveryBoy.name}</strong></span>
                              <a href={`tel:${ord.deliveryBoy.phone}`} className="boy-call-link">
                                <Phone size={12} /> Call Partner
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer billing actions */}
                      <div className="to-card-footer">
                        <div className="collect-totals">
                          {ord.deliveryFee !== undefined && (
                            <span className="lbl" style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "4px" }}>
                              Subtotal: ₹{ord.subtotal !== undefined ? ord.subtotal : (ord.totalAmount - (ord.deliveryFee || 0))} | Delivery Fee: {ord.deliveryFee === 0 ? "Free" : `₹${ord.deliveryFee}`}
                            </span>
                          )}
                          <span className="lbl">Total Paid (COD):</span>
                          <span className="val">₹{ord.totalAmount}</span>
                        </div>
                        {ord.orderStatus === "Placed" && (
                          <button
                            onClick={() => handleCancelOrder(ord.OrderNumber)}
                            className="to-cancel-btn"
                          >
                            <Trash2 size={14} style={{ marginRight: "4px" }} /> Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );

  // Helper helper to handle phone change inputs
  function setPhoneValue(val) {
    if (val === "" || (/^\d+$/.test(val) && val.length <= 10)) {
      setCustomerPhone(val);
    }
  }
};

export default TrackOrders;
