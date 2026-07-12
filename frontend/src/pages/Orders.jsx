import React, { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import accountantService from "../services/accountantService";
import { Check, Truck, Clock, AlertCircle, RefreshCw, Eye, X } from "lucide-react";
import "./Orders.css";

const Orders = () => {
  const { showSuccess, showError, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState("pending");
  const [orders, setOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningMap, setAssigningMap] = useState({}); // orderNumber -> deliveryBoyId selection
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

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

  const handleAssignDeliveryBoy = async (orderNumber) => {
    const dboyId = assigningMap[orderNumber];
    if (!dboyId) {
      showInfo("Please select a delivery boy first.");
      return;
    }
    try {
      setActionLoading(true);
      await accountantService.assignDeliveryBoy(orderNumber, dboyId);
      showSuccess(`Assigned delivery boy to order ${orderNumber}!`);
      // clear map selection
      setAssigningMap(prev => {
        const next = { ...prev };
        delete next[orderNumber];
        return next;
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to assign delivery boy.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectDboyChange = (orderNumber, val) => {
    setAssigningMap(prev => ({
      ...prev,
      [orderNumber]: val
    }));
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
                        <button
                          className="btn-action-accept"
                          onClick={() => handleAcceptOrder(ord.OrderNumber)}
                          disabled={actionLoading}
                        >
                          <Check size={14} /> Accept Order
                        </button>
                      )}

                      {activeTab === "accepted" && (
                        <div className="assign-action-box">
                          <select
                            value={assigningMap[ord.OrderNumber] || ""}
                            onChange={(e) => handleSelectDboyChange(ord.OrderNumber, e.target.value)}
                            className="dboy-select"
                          >
                            <option value="">-- Select Delivery Boy --</option>
                            {deliveryBoys.map((db) => (
                              <option key={db._id} value={db._id}>
                                {db.name} ({db.isAvailable ? "Available" : "Busy"})
                              </option>
                            ))}
                          </select>
                          <button
                            className="btn-action-assign"
                            onClick={() => handleAssignDeliveryBoy(ord.OrderNumber)}
                            disabled={actionLoading || !assigningMap[ord.OrderNumber]}
                          >
                            <Truck size={14} /> Assign
                          </button>
                        </div>
                      )}

                      {activeTab === "assigned" && ord.deliveryBoy && (
                        <div className="assigned-boy-tag">
                          <span>👤 {ord.deliveryBoy.name}</span>
                          <span className="phone">{ord.deliveryBoy.phone}</span>
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
    </div>
  );
};

export default Orders;
