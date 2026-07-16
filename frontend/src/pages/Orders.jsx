import React, { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import accountantService from "../services/accountantService";
import { Check, Truck, Clock, AlertCircle, RefreshCw, Eye, X, Copy, CheckCircle2 } from "lucide-react";
import Modal from "../components/common/Modal";
import "./Orders.css";

const Orders = () => {
  const { showSuccess, showError, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState("pending");
  const [orders, setOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Assignment Modal States
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState(null);
  const [isTemp, setIsTemp] = useState(false);
  const [selectedDboyId, setSelectedDboyId] = useState("");
  const [tempDboyName, setTempDboyName] = useState("");
  const [tempDboyPhone, setTempDboyPhone] = useState("");

  // Standalone Link States
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  // Fetch orders based on active tab
  const fetchOrders = async () => {
    try {
      setLoading(true);
      let res;
      if (activeTab === "pending") {
        res = await accountantService.getPendingOrders();
      } else if (activeTab === "accepted") {
        res = await accountantService.getAcceptedOrders();
      } else {
        res = await accountantService.getAssignedOrders();
      }
      setOrders(res.orders || []);
    } catch (err) {
      console.error(err);
      showError("Failed to retrieve orders.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available delivery boys
  const fetchDeliveryBoys = async () => {
    try {
      const res = await accountantService.getAllDeliveryBoys();
      setDeliveryBoys(res.deliveryBoys || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    if (activeTab === "accepted") {
      fetchDeliveryBoys();
    }
  }, [activeTab]);

  const handleAcceptOrder = async (orderNumber) => {
    try {
      setActionLoading(true);
      await accountantService.acceptOrder(orderNumber);
      showSuccess(`Order ${orderNumber} accepted successfully!`);
      fetchOrders();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to accept order.");
    } finally {
      setActionLoading(false);
    }
  };

  const openAssignModal = (ord) => {
    setOrderToAssign(ord);
    setIsTemp(false);
    setSelectedDboyId("");
    setTempDboyName("");
    setTempDboyPhone("");
    setAssignModalOpen(true);
  };

  const handleAssignDeliveryBoySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!orderToAssign) return;

    if (isTemp) {
      if (!tempDboyName.trim() || !tempDboyPhone.trim()) {
        showError("Please enter temporary delivery boy name and mobile number.");
        return;
      }
      if (tempDboyPhone.trim().length !== 10 || !/^\d+$/.test(tempDboyPhone.trim())) {
        showError("Please enter a valid 10-digit mobile number.");
        return;
      }
    } else {
      if (!selectedDboyId) {
        showError("Please select a delivery boy.");
        return;
      }
    }

    try {
      setActionLoading(true);
      await accountantService.assignDeliveryBoy(
        orderToAssign.OrderNumber,
        isTemp ? null : selectedDboyId,
        isTemp,
        isTemp ? tempDboyName.trim() : "",
        isTemp ? tempDboyPhone.trim() : ""
      );

      showSuccess(`Delivery boy assigned successfully for order ${orderToAssign.OrderNumber}!`);
      
      const link = `${window.location.origin}/delivery-order/${orderToAssign.OrderNumber}`;
      setGeneratedLink(link);
      setAssignModalOpen(false);
      setLinkModalOpen(true);

      fetchOrders();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to assign delivery boy.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (orderNumber, status) => {
    let cancelReason = "";
    if (status === "Cancelled") {
      const confirmCancel = window.confirm(`Are you sure you want to cancel order ${orderNumber}?`);
      if (!confirmCancel) return;
      
      while (true) {
        cancelReason = prompt("Please enter the reason for cancellation (Required):");
        if (cancelReason === null) {
          // User clicked Cancel on prompt
          return;
        }
        cancelReason = cancelReason.trim();
        if (cancelReason !== "") {
          break;
        }
        alert("A cancellation reason is required to cancel this order.");
      }
    } else {
      const confirmDeliver = window.confirm(`Confirm that order ${orderNumber} is delivered successfully (verified with customer)?`);
      if (!confirmDeliver) return;
    }

    try {
      setActionLoading(true);
      await accountantService.updateOrderStatus(orderNumber, status, cancelReason);
      showSuccess(`Order ${orderNumber} status updated to ${status}!`);
      fetchOrders();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to update order status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyLink = (orderNumber) => {
    const link = `${window.location.origin}/delivery-order/${orderNumber}`;
    navigator.clipboard.writeText(link);
    showSuccess("Delivery tracking link copied to clipboard!");
  };

  return (
    <div className="orders-page-root">
      <div className="orders-header-row">
        <div>
          <p className="subtitle">Customer Deliveries Management</p>
          <h2 className="title">📦 Orders Log & Assignments</h2>
        </div>
        <button className="refresh-btn" onClick={fetchOrders} disabled={loading}>
          <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh Log
        </button>
      </div>

      {/* Tabs */}
      <div className="orders-tabs">
        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Placed ({activeTab === "pending" && !loading ? orders.length : "?"})
        </button>
        <button
          className={`tab-btn ${activeTab === "accepted" ? "active" : ""}`}
          onClick={() => setActiveTab("accepted")}
        >
          Accepted Orders ({activeTab === "accepted" && !loading ? orders.length : "?"})
        </button>
        <button
          className={`tab-btn ${activeTab === "assigned" ? "active" : ""}`}
          onClick={() => setActiveTab("assigned")}
        >
          Assigned & Delivery History ({activeTab === "assigned" && !loading ? orders.length : "?"})
        </button>
      </div>

      {/* Order Lists Grid */}
      {loading ? (
        <div className="orders-loader">
          <div className="spinner"></div>
          <p>Loading customer orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="orders-empty-state">
          <AlertCircle size={48} />
          <h3>No Orders Found</h3>
          <p>There are no customer orders in this category right now.</p>
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Products Count</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions / Assignment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord._id}>
                  <td data-label="Order Number" className="ord-num-cell">
                    <strong>{ord.OrderNumber}</strong>
                    <span className="ord-date">{new Date(ord.placedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}</span>
                  </td>
                  <td data-label="Customer">
                    <div className="cust-info-cell">
                      <span className="name">{ord.customerId?.customerName || "Anonymous"}</span>
                      <span className="phone">+{ord.customerId?.customerPhone || "N/A"}</span>
                    </div>
                  </td>
                  <td data-label="Products Count">
                    {ord.products?.length || 0} Items
                  </td>
                  <td data-label="Total Amount" className="total-amount-cell">
                    ₹{ord.totalAmount}
                  </td>
                  <td data-label="Status">
                    <span className={`status-tag ${ord.orderStatus?.toLowerCase().replace(/\s+/g, "-")}`}>
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td data-label="Actions / Assignment">
                    <div className="table-actions-flex">
                      <button
                        className="btn-action-view"
                        onClick={() => setSelectedOrderDetails(ord)}
                        title="View Details"
                      >
                        <Eye size={16} /> Details
                      </button>

                      {activeTab === "pending" && (
                        <>
                          <button
                            className="btn-action-accept"
                            onClick={() => handleAcceptOrder(ord.OrderNumber)}
                            disabled={actionLoading}
                          >
                            <Check size={14} /> Accept Order
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(ord.OrderNumber, "Cancelled")}
                            className="btn btn-danger btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", fontSize: "0.8rem", borderRadius: "4px" }}
                            title="Cancel Order"
                            disabled={actionLoading}
                          >
                            <X size={12} /> Cancel
                          </button>
                        </>
                      )}

                      {activeTab === "accepted" && (
                        <>
                          <button
                            className="btn-action-assign"
                            onClick={() => openAssignModal(ord)}
                            disabled={actionLoading}
                            style={{ display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            <Truck size={14} /> Assign Delivery
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(ord.OrderNumber, "Cancelled")}
                            className="btn btn-danger btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", fontSize: "0.8rem", borderRadius: "4px" }}
                            title="Cancel Order"
                            disabled={actionLoading}
                          >
                            <X size={12} /> Cancel
                          </button>
                        </>
                      )}

                      {activeTab === "assigned" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
                          <div className="assigned-boy-tag">
                            {ord.isTempDelivery ? (
                              <>
                                <span>👤 {ord.tempDeliveryBoy?.name} <small style={{color: "var(--color-primary)", fontWeight: 700}}>(Temp)</small></span>
                                <span className="phone">{ord.tempDeliveryBoy?.phone}</span>
                              </>
                            ) : (
                              <>
                                <span>👤 {ord.deliveryBoy?.name || "Staff"}</span>
                                <span className="phone">{ord.deliveryBoy?.phone || "N/A"}</span>
                              </>
                            )}
                          </div>
                          
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                            <button
                              onClick={() => handleCopyLink(ord.OrderNumber)}
                              className="btn btn-secondary btn-sm"
                              style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", fontSize: "0.75rem" }}
                              title="Copy Standalone Delivery Link"
                            >
                              <Copy size={12} /> Link
                            </button>
                            
                            {["Assigned", "Out for Delivery"].includes(ord.orderStatus) && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(ord.OrderNumber, "Delivered")}
                                  className="btn btn-primary btn-sm"
                                  style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", backgroundColor: "#38a169", borderColor: "#38a169", fontSize: "0.75rem" }}
                                  title="Mark order as Delivered"
                                >
                                  <Check size={12} /> Deliver
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(ord.OrderNumber, "Cancelled")}
                                  className="btn btn-danger btn-sm"
                                  style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", fontSize: "0.75rem" }}
                                  title="Cancel Order"
                                >
                                  <X size={12} /> Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Popup Modal */}
      {selectedOrderDetails && (
        <div className="orders-modal-overlay" onClick={() => setSelectedOrderDetails(null)}>
          <div className="orders-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order {selectedOrderDetails.OrderNumber} Details</h3>
              <button className="close-btn" onClick={() => setSelectedOrderDetails(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section-grid">
                <div>
                  <h5>Customer Details</h5>
                  <p><strong>Name:</strong> {selectedOrderDetails.customerId?.customerName || "Anonymous"}</p>
                  <p><strong>Phone:</strong> {selectedOrderDetails.customerId?.customerPhone || "N/A"}</p>
                </div>
                <div>
                  <h5>Delivery Address</h5>
                  <p>
                    {selectedOrderDetails.address.houseNo ? `${selectedOrderDetails.address.houseNo}, ` : ""}
                    {selectedOrderDetails.address.street}, {selectedOrderDetails.address.city} - {selectedOrderDetails.address.pincode}
                  </p>
                  {selectedOrderDetails.address.landmark && (
                    <p><strong>Landmark:</strong> {selectedOrderDetails.address.landmark}</p>
                  )}
                </div>
              </div>

              <div className="modal-section">
                <h5>Products Ordered</h5>
                <div className="modal-products-list">
                  {selectedOrderDetails.products?.map((item, idx) => (
                    <div key={idx} className="modal-product-row">
                      <span>{item.product?.name || "Product"}</span>
                      <span>Qty: {item.quantity}</span>
                      <span>₹{(item.product?.retailPrice || item.product?.price || 0) * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h5>Order Summary</h5>
                <div className="modal-summary-box">
                  <div className="summary-line">
                    <span>Subtotal</span>
                    <span>₹{selectedOrderDetails.subtotal}</span>
                  </div>
                  <div className="summary-line">
                    <span>Delivery Fee</span>
                    <span>₹{selectedOrderDetails.deliveryFee}</span>
                  </div>
                  <div className="summary-line grand-total">
                    <span>Grand Total (COD)</span>
                    <span>₹{selectedOrderDetails.totalAmount}</span>
                  </div>
                </div>
              </div>

               {selectedOrderDetails.notes && (
                <div className="modal-section">
                  <h5>Special Instructions</h5>
                  <p className="delivery-notes">"{selectedOrderDetails.notes}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Delivery Boy Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => !actionLoading && setAssignModalOpen(false)}
        title="Assign Delivery Boy"
        footer={
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setAssignModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleAssignDeliveryBoySubmit}
              className="btn btn-primary"
            >
              {actionLoading ? "Assigning..." : "Assign Boy"}
            </button>
          </div>
        }
      >
        {orderToAssign && (
          <form onSubmit={handleAssignDeliveryBoySubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                Assigning delivery partner for Order: <strong>{orderToAssign.OrderNumber}</strong>
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                Customer Name: {orderToAssign.customerId?.customerName || "Anonymous"}
              </p>
            </div>

            {/* Toggle Switch */}
            <div style={{ display: "flex", background: "#f0f4f8", padding: "4px", borderRadius: "8px", gap: "4px" }}>
              <button
                type="button"
                className={`tab-btn ${!isTemp ? "active" : ""}`}
                style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", background: !isTemp ? "white" : "transparent", boxShadow: !isTemp ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }}
                onClick={() => setIsTemp(false)}
              >
                Permanent Staff
              </button>
              <button
                type="button"
                className={`tab-btn ${isTemp ? "active" : ""}`}
                style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", background: isTemp ? "white" : "transparent", boxShadow: isTemp ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }}
                onClick={() => setIsTemp(true)}
              >
                Temporary / Friend
              </button>
            </div>

            {!isTemp ? (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="dboy-id">Select Registered Delivery Partner *</label>
                <select
                  id="dboy-id"
                  className="form-input"
                  value={selectedDboyId}
                  onChange={(e) => setSelectedDboyId(e.target.value)}
                  disabled={actionLoading}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                >
                  <option value="">-- Choose Partner --</option>
                  {deliveryBoys.map((db) => (
                    <option key={db._id} value={db._id}>
                      {db.name} ({db.phone}) - {db.isAvailable ? "Available" : "Busy"}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="temp-name">Delivery Person Name *</label>
                  <input
                    id="temp-name"
                    type="text"
                    className="form-input"
                    placeholder="Enter Name"
                    value={tempDboyName}
                    onChange={(e) => setTempDboyName(e.target.value)}
                    disabled={actionLoading}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="temp-phone">Mobile Number *</label>
                  <input
                    id="temp-phone"
                    type="text"
                    className="form-input"
                    placeholder="10-digit mobile number"
                    value={tempDboyPhone}
                    onChange={(e) => setTempDboyPhone(e.target.value)}
                    disabled={actionLoading}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                  />
                </div>
              </div>
            )}
          </form>
        )}
      </Modal>

      {/* Generated Link Copy Popup Modal */}
      <Modal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title="Delivery Assignment Complete!"
        footer={
          <button
            type="button"
            onClick={() => setLinkModalOpen(false)}
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            Close Dialog
          </button>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "center", padding: "10px 0" }}>
          <div style={{ display: "inline-flex", alignSelf: "center", justifyContent: "center", alignItems: "center", width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#e6fffa", color: "#319795" }}>
            <CheckCircle2 size={24} />
          </div>
          <h4 style={{ margin: 0, fontSize: "1.1rem" }}>Standalone Link Generated</h4>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
            Send this link to the delivery person. They can open it on their mobile phone to view order and customer details.
          </p>
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <input
              type="text"
              readOnly
              className="form-input"
              value={generatedLink}
              style={{ flex: 1, background: "#f7fafc", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "8px 12px", fontSize: "0.85rem", color: "var(--color-text-primary)" }}
              onClick={(e) => e.target.select()}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedLink);
                showSuccess("Delivery link copied to clipboard!");
              }}
              className="btn btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
            >
              <Copy size={14} /> Copy Link
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Orders;
