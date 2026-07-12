import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import deliveryBoyService from "../services/deliveryBoyService";
import { LogOut, Phone, MapPin, CheckCircle, XCircle, RefreshCw, Clock } from "lucide-react";
import "./DeliveryDashboard.css";

const DeliveryDashboard = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();

  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Delivery confirmation OTP flow states
  const [otpVerifyOrder, setOtpVerifyOrder] = useState(null);
  const [deliveryOtpCode, setDeliveryOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);

  // Load profile and fetch orders
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const profileStr = localStorage.getItem("delivery_info");
      if (!profileStr) {
        navigate("/delivery/login");
        return;
      }
      const boy = JSON.parse(profileStr);
      setDeliveryBoy(boy);

      const res = await deliveryBoyService.getAssignedOrders();
      const allOrders = res.orders || [];

      // Active orders are Assigned or Out for Delivery
      const active = allOrders.filter(o => ["Assigned", "Out for Delivery"].includes(o.orderStatus));
      // Past orders are Delivered or Cancelled
      const past = allOrders.filter(o => ["Delivered", "Cancelled"].includes(o.orderStatus));

      setActiveOrders(active);
      setPastOrders(past);
    } catch (err) {
      console.error(err);
      showError("Failed to retrieve assigned orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleUpdateStatus = async (orderNumber, nextStatus) => {
    let cancelReason = "";
    if (nextStatus === "Cancelled") {
      const reason = prompt("Please enter the reason for cancellation:") || "";
      if (!reason.trim()) {
        showInfo("Cancellation aborted (reason required).");
        return;
      }
      cancelReason = reason;
    }

    try {
      setUpdatingId(orderNumber);
      await deliveryBoyService.updateOrderStatus(orderNumber, nextStatus, cancelReason);
      showSuccess(`Order status updated to: ${nextStatus}`);
      loadDashboardData();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleInitiateDeliveryComplete = async (ord) => {
    try {
      setSendingOtp(true);
      setOtpVerifyOrder(ord);
      setDeliveryOtpCode("");
      await deliveryBoyService.sendDeliveryOtp(ord.OrderNumber);
      showSuccess("Delivery confirmation OTP generated and sent to customer!");
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to generate delivery OTP.");
      setOtpVerifyOrder(null);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    if (!deliveryOtpCode || deliveryOtpCode.length !== 6 || !/^\d+$/.test(deliveryOtpCode)) {
      showError("Please enter a valid 6-digit OTP code");
      return;
    }

    try {
      setUpdatingId(otpVerifyOrder.OrderNumber);
      await deliveryBoyService.updateOrderStatus(
        otpVerifyOrder.OrderNumber,
        "Delivered",
        "",
        deliveryOtpCode
      );
      showSuccess("Order delivered successfully!");
      setOtpVerifyOrder(null);
      loadDashboardData();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "OTP verification failed. Check again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("delivery_token");
    localStorage.removeItem("delivery_info");
    showInfo("Logged out of portal.");
    navigate("/delivery/login");
  };

  return (
    <div className="db-dash-root">
      {/* Header bar */}
      <header className="db-dash-header">
        <div className="db-header-left">
          <div className="db-avatar">{deliveryBoy?.name?.[0]?.toUpperCase() || "D"}</div>
          <div className="db-user-details">
            <h3>{deliveryBoy?.name || "Delivery Partner"}</h3>
            <span className="perk-badge">⚡ Visakha Partner</span>
          </div>
        </div>
        <button onClick={handleLogout} className="db-logout-btn" title="Sign Out">
          <LogOut size={20} />
        </button>
      </header>

      <div className="db-dash-container">
        <div className="db-section-header">
          <h4>📍 Your Delivery Tasks</h4>
          <button className="db-refresh-btn" onClick={loadDashboardData} disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="db-loader">
            <div className="spinner"></div>
            <p>Fetching assigned tasks...</p>
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="db-empty-state">
            <span className="emoji">🎉</span>
            <h4>All Done!</h4>
            <p>You have no active pending deliveries assigned to you.</p>
          </div>
        ) : (
          <div className="db-tasks-list">
            {activeOrders.map((ord) => (
              <div key={ord._id} className="db-task-card">
                {/* Header info */}
                <div className="db-task-header">
                  <div className="order-details">
                    <span className="order-num">{ord.OrderNumber}</span>
                    <span className="order-time">
                      <Clock size={12} style={{ marginRight: "4px" }} />
                      {new Date(ord.placedAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <span className={`status-badge ${ord.orderStatus?.toLowerCase().replace(/\s+/g, "-")}`}>
                    {ord.orderStatus}
                  </span>
                </div>

                {/* Body details */}
                <div className="db-task-body">
                  <div className="info-block">
                    <span className="label">Customer Name</span>
                    <div className="customer-row">
                      <span className="value font-bold">{ord.customerId?.customerName || "Anonymous"}</span>
                      {ord.customerId?.customerPhone && (
                        <a href={`tel:${ord.customerId.customerPhone}`} className="call-btn-link">
                          <Phone size={14} /> Call Customer
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="info-block">
                    <span className="label">Delivery Address</span>
                    <p className="address-text">
                      <MapPin size={14} className="pin-icon" />
                      {ord.address.houseNo ? `${ord.address.houseNo}, ` : ""}
                      {ord.address.street}, {ord.address.city} - {ord.address.pincode}
                    </p>
                    {ord.address.landmark && (
                      <span className="landmark">Landmark: {ord.address.landmark}</span>
                    )}
                  </div>

                  {ord.notes && (
                    <div className="info-block notes-block">
                      <span className="label">Delivery Instructions</span>
                      <p className="notes-text">"{ord.notes}"</p>
                    </div>
                  )}

                  <div className="info-block products-block">
                    <span className="label">Items Checklist</span>
                    <div className="products-summary">
                      {ord.products?.map((item, idx) => (
                        <div key={idx} className="product-qty-row">
                          <span>{item.product?.name || "Product"}</span>
                          <strong>x{item.quantity}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Total amount collect section */}
                <div className="db-task-collect-box">
                  <span className="lbl font-bold">Collect Amount (COD):</span>
                  <span className="amount font-extrabold">₹{ord.totalAmount}</span>
                </div>

                {/* Card Actions buttons & Inline OTP verify section */}
                <div className="db-task-actions-row" style={{ flexDirection: "column", gap: "8px" }}>
                  {otpVerifyOrder?.OrderNumber === ord.OrderNumber ? (
                    <div className="db-inline-otp-box" style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%" }}>
                      <p style={{ fontSize: "0.8rem", color: "#475569", marginBottom: "8px", fontWeight: 600 }}>
                        🔑 Enter 6-digit OTP code sent to customer:
                      </p>
                      <form onSubmit={handleConfirmDelivery} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                          type="text"
                          pattern="\d*"
                          placeholder="OTP Code"
                          value={deliveryOtpCode}
                          onChange={(e) => setDeliveryOtpCode(e.target.value)}
                          maxLength="6"
                          required
                          style={{ flex: 1, padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "1rem", fontWeight: 700, letterSpacing: "2px", textAlign: "center", minHeight: "38px" }}
                        />
                        <button
                          type="submit"
                          disabled={updatingId === ord.OrderNumber}
                          className="btn-db-action finish-run"
                          style={{ flexShrink: 0, padding: "8px 12px", fontSize: "0.85rem", minHeight: "38px", borderRadius: "6px" }}
                        >
                          Verify
                        </button>
                      </form>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "0.75rem" }}>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              setSendingOtp(true);
                              await deliveryBoyService.sendDeliveryOtp(ord.OrderNumber);
                              showSuccess("Resent OTP code.");
                            } catch (err) {
                              showError("Failed to resend OTP.");
                            } finally {
                              setSendingOtp(false);
                            }
                          }}
                          disabled={sendingOtp}
                          style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", padding: 0, minHeight: "auto" }}
                        >
                          Resend OTP
                        </button>
                        <button
                          type="button"
                          onClick={() => setOtpVerifyOrder(null)}
                          style={{ background: "none", border: "none", color: "#ef4444", fontWeight: 700, cursor: "pointer", padding: 0, minHeight: "auto" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : ord.orderStatus === "Assigned" ? (
                    <button
                      className="btn-db-action start-run"
                      onClick={() => handleUpdateStatus(ord.OrderNumber, "Out for Delivery")}
                      disabled={updatingId === ord.OrderNumber}
                      style={{ width: "100%" }}
                    >
                      <TruckIcon size={16} /> Start Delivery Run
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                      <button
                        className="btn-db-action finish-run"
                        onClick={() => handleInitiateDeliveryComplete(ord)}
                        disabled={updatingId === ord.OrderNumber}
                        style={{ flex: 1 }}
                      >
                        <CheckCircle size={16} /> Finished (Delivered)
                      </button>
                      <button
                        className="btn-db-action cancel-run"
                        onClick={() => handleUpdateStatus(ord.OrderNumber, "Cancelled")}
                        disabled={updatingId === ord.OrderNumber}
                        style={{ flex: 1 }}
                      >
                        <XCircle size={16} /> Cancel Delivery
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Collapsible Completed History Section */}
        {pastOrders.length > 0 && (
          <div className="db-history-section">
            <h5 className="history-title">📜 Completed History ({pastOrders.length})</h5>
            <div className="db-history-list">
              {pastOrders.map((ord) => (
                <div key={ord._id} className="db-history-card">
                  <div className="history-header">
                    <strong>{ord.OrderNumber}</strong>
                    <span className={`status-badge ${ord.orderStatus?.toLowerCase().replace(/\s+/g, "-")}`}>
                      {ord.orderStatus}
                    </span>
                  </div>
                  <div className="history-body">
                    <p>Collect: <strong>₹{ord.totalAmount}</strong> | Customer: {ord.customerId?.customerName || "Anonymous"}</p>
                    <span className="date">{new Date(ord.updatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}</span>
                    {ord.orderStatus === "Cancelled" && ord.cancelReason && (
                      <p className="cancel-reason">Reason: "{ord.cancelReason}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper TruckIcon for start run button
const TruckIcon = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

export default DeliveryDashboard;
