import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import couponService from "../services/couponService";
import { TableSkeleton } from "../components/common/Skeleton";
import Modal from "../components/common/Modal";
import EmptyState from "../components/common/EmptyState";
import { Ticket, Trash2, Edit, Plus, ToggleLeft, ToggleRight, Check, X, Calendar } from "lucide-react";

const Coupons = () => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponData, setCouponData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: "",
    maxDiscount: "",
    expiryDate: "",
    usageLimit: "",
    perCustomerLimit: "1",
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch all coupons
  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await couponService.getCoupons();
      setCoupons(data || []);
    } catch (err) {
      console.error(err);
      showError("Failed to fetch coupons list.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  // Open modal for add
  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setCouponData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minPurchase: "0",
      maxDiscount: "",
      expiryDate: "",
      usageLimit: "",
      perCustomerLimit: "1",
      isActive: true,
    });
    setErrors({});
    setCouponModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setCouponData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPurchase: coupon.minPurchase.toString(),
      maxDiscount: coupon.maxDiscount ? coupon.maxDiscount.toString() : "",
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split("T")[0] : "",
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : "",
      perCustomerLimit: coupon.perCustomerLimit ? coupon.perCustomerLimit.toString() : "1",
      isActive: coupon.isActive,
    });
    setErrors({});
    setCouponModalOpen(true);
  };

  // Handle Form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCouponData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Form validation
  const validateForm = () => {
    const tempErrors = {};
    if (!couponData.code.trim()) tempErrors.code = "Coupon code is required.";
    else if (!/^[A-Z0-9_-]+$/i.test(couponData.code)) {
      tempErrors.code = "Only alphanumeric characters, dashes, and underscores allowed.";
    }

    if (!couponData.discountValue) tempErrors.discountValue = "Discount value is required.";
    else {
      const val = parseFloat(couponData.discountValue);
      if (isNaN(val) || val <= 0) {
        tempErrors.discountValue = "Must be a positive number.";
      } else if (couponData.discountType === "percentage" && val > 100) {
        tempErrors.discountValue = "Percentage discount cannot exceed 100%.";
      }
    }

    if (couponData.minPurchase) {
      const min = parseFloat(couponData.minPurchase);
      if (isNaN(min) || min < 0) {
        tempErrors.minPurchase = "Must be 0 or higher.";
      }
    }

    if (couponData.maxDiscount) {
      const max = parseFloat(couponData.maxDiscount);
      if (isNaN(max) || max <= 0) {
        tempErrors.maxDiscount = "Must be a positive number.";
      }
    }

    if (couponData.usageLimit) {
      const lim = parseInt(couponData.usageLimit, 10);
      if (isNaN(lim) || lim <= 0) {
        tempErrors.usageLimit = "Must be a positive integer.";
      }
    }

    if (couponData.perCustomerLimit) {
      const clim = parseInt(couponData.perCustomerLimit, 10);
      if (isNaN(clim) || clim <= 0) {
        tempErrors.perCustomerLimit = "Must be a positive integer.";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit create/edit coupon
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        code: couponData.code.toUpperCase().trim(),
        discountType: couponData.discountType,
        discountValue: parseFloat(couponData.discountValue),
        minPurchase: parseFloat(couponData.minPurchase || 0),
        maxDiscount: couponData.maxDiscount ? parseFloat(couponData.maxDiscount) : null,
        expiryDate: couponData.expiryDate ? couponData.expiryDate : null,
        usageLimit: couponData.usageLimit ? parseInt(couponData.usageLimit, 10) : null,
        perCustomerLimit: couponData.perCustomerLimit ? parseInt(couponData.perCustomerLimit, 10) : null,
        isActive: couponData.isActive,
      };

      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon._id, payload);
        showSuccess(`Coupon '${payload.code}' updated successfully.`);
      } else {
        await couponService.createCoupon(payload);
        showSuccess(`Coupon '${payload.code}' created successfully.`);
      }

      setCouponModalOpen(false);
      loadCoupons();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to save coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle active status directly
  const handleToggleActive = async (coupon) => {
    try {
      const updated = { ...coupon, isActive: !coupon.isActive };
      await couponService.updateCoupon(coupon._id, { isActive: !coupon.isActive });
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !coupon.isActive } : c))
      );
      showSuccess(`Coupon '${coupon.code}' ${!coupon.isActive ? "activated" : "deactivated"} successfully.`);
    } catch (err) {
      console.error(err);
      showError("Failed to update coupon status.");
    }
  };

  // Open delete modal
  const handleOpenDeleteModal = (coupon) => {
    setCouponToDelete(coupon);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;
    setDeleting(true);
    try {
      await couponService.deleteCoupon(couponToDelete._id);
      showSuccess(`Coupon '${couponToDelete.code}' deleted successfully.`);
      setDeleteModalOpen(false);
      setCouponToDelete(null);
      loadCoupons();
    } catch (err) {
      console.error(err);
      showError("Failed to delete coupon.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card-panel">
      {/* Header and Add Action */}
      <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 className="panel-title" style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
            <Ticket size={24} style={{ color: "var(--color-primary)" }} />
            Discount Coupons
          </h3>
          <p className="panel-subtitle" style={{ margin: "4px 0 0 0", color: "var(--color-text-secondary)" }}>
            Create and manage promotional discount coupon codes for customer orders
          </p>
        </div>
        {currentUser?.role === "admin" && (
          <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={18} /> Add Coupon
          </button>
        )}
      </div>

      {/* Main Table view */}
      {loading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : coupons.length === 0 ? (
        <EmptyState
          title="No Coupons Defined"
          description="Create coupon codes that customers can enter at checkout to redeem discount benefits."
          icon={Ticket}
          actionLabel={currentUser?.role === "admin" ? "Create First Coupon" : null}
          onAction={currentUser?.role === "admin" ? handleOpenAddModal : null}
        />
      ) : (
        <div className="table-wrapper">
          <table className="custom-table responsive-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount Type</th>
                <th>Benefit Value</th>
                <th>Min Purchase</th>
                <th>Usage Limit</th>
                <th>Expires</th>
                <th style={{ textAlign: "center" }}>Status</th>
                {currentUser?.role === "admin" && <th style={{ textAlign: "right" }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                return (
                  <tr key={coupon._id} style={{ opacity: isExpired ? 0.65 : 1 }}>
                    <td data-label="Coupon Code">
                      <span className="badge" style={{
                        fontFamily: "monospace",
                        fontSize: "0.95rem",
                        padding: "6px 12px",
                        backgroundColor: isExpired ? "#e2e8f0" : "rgba(37, 99, 235, 0.1)",
                        color: isExpired ? "#64748b" : "var(--color-primary)",
                        border: "1px solid rgba(37, 99, 235, 0.2)",
                        borderRadius: "6px"
                      }}>
                        {coupon.code}
                      </span>
                    </td>
                    <td data-label="Discount Type" style={{ textTransform: "capitalize", fontWeight: 600 }}>
                      {coupon.discountType}
                    </td>
                    <td data-label="Benefit Value" style={{ fontWeight: 700, color: "var(--color-success)" }}>
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                      {coupon.discountType === "percentage" && coupon.maxDiscount && (
                        <span style={{ fontSize: "0.75rem", display: "block", fontWeight: 400, color: "var(--color-text-secondary)" }}>
                          Max: ₹{coupon.maxDiscount}
                        </span>
                      )}
                    </td>
                    <td data-label="Min Purchase">₹{coupon.minPurchase || 0}</td>
                    <td data-label="Usage Limit">
                      <span style={{ fontWeight: 600 }}>{coupon.usedCount}</span>
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : " (Unlimited)"}
                      <span style={{ fontSize: "0.72rem", display: "block", color: "var(--color-text-secondary)", fontWeight: 400 }}>
                        Limit: {coupon.perCustomerLimit || "No limit"} per user
                      </span>
                    </td>
                    <td data-label="Expires">
                      {coupon.expiryDate ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem" }}>
                          <Calendar size={13} />
                          {new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      ) : (
                        <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Never</span>
                      )}
                      {isExpired && (
                        <span className="badge badge-danger" style={{ fontSize: "0.65rem", padding: "2px 4px", marginLeft: "4px" }}>
                          Expired
                        </span>
                      )}
                    </td>
                    <td data-label="Status" style={{ textAlign: "center" }}>
                      {currentUser?.role === "admin" ? (
                        <button
                          onClick={() => handleToggleActive(coupon)}
                          disabled={isExpired}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: isExpired ? "not-allowed" : "pointer",
                            color: coupon.isActive && !isExpired ? "var(--color-success)" : "var(--color-text-secondary)",
                            padding: 0
                          }}
                          title={coupon.isActive ? "Deactivate Coupon" : "Activate Coupon"}
                        >
                          {coupon.isActive && !isExpired ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
                        </button>
                      ) : (
                        <span className={`badge ${coupon.isActive && !isExpired ? "badge-success" : "badge-secondary"}`}>
                          {coupon.isActive && !isExpired ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>
                    {currentUser?.role === "admin" && (
                      <td data-label="Actions" style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            onClick={() => handleOpenEditModal(coupon)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Coupon"
                            style={{ padding: "6px 10px" }}
                          >
                            <Edit size={16} /> Edit
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(coupon)}
                            className="btn btn-danger btn-sm"
                            title="Delete Coupon"
                            style={{ padding: "6px 10px" }}
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal Form */}
      <Modal
        isOpen={couponModalOpen}
        onClose={() => !submitting && setCouponModalOpen(false)}
        title={editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Add New Coupon"}
        footer={
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              disabled={submitting}
              onClick={() => setCouponModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="coupon-form"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? "Saving..." : editingCoupon ? "Save Changes" : "Create Coupon"}
            </button>
          </div>
        }
      >
        <form id="coupon-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="code">Coupon Code *</label>
            <input
              type="text"
              id="code"
              name="code"
              value={couponData.code}
              onChange={handleChange}
              placeholder="e.g. VISAKHA20"
              disabled={!!editingCoupon}
              className="form-input"
              style={{ textTransform: "uppercase" }}
              required
            />
            {errors.code && <span className="form-error-msg">{errors.code}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="discountType">Discount Type *</label>
              <select
                id="discountType"
                name="discountType"
                value={couponData.discountType}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="discountValue">Discount Value *</label>
              <input
                type="number"
                id="discountValue"
                name="discountValue"
                value={couponData.discountValue}
                onChange={handleChange}
                placeholder={couponData.discountType === "percentage" ? "e.g. 10" : "e.g. 50"}
                className="form-input"
                step="any"
                min="0"
                required
              />
              {errors.discountValue && <span className="form-error-msg">{errors.discountValue}</span>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="minPurchase">Min Purchase Amount (₹)</label>
              <input
                type="number"
                id="minPurchase"
                name="minPurchase"
                value={couponData.minPurchase}
                onChange={handleChange}
                placeholder="e.g. 200"
                className="form-input"
                min="0"
              />
              {errors.minPurchase && <span className="form-error-msg">{errors.minPurchase}</span>}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="maxDiscount">Max Discount Limit (₹)</label>
              <input
                type="number"
                id="maxDiscount"
                name="maxDiscount"
                value={couponData.maxDiscount}
                onChange={handleChange}
                placeholder="e.g. 100"
                className="form-input"
                min="0"
                disabled={couponData.discountType !== "percentage"}
              />
              {errors.maxDiscount && <span className="form-error-msg">{errors.maxDiscount}</span>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="expiryDate">Expiry Date</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={couponData.expiryDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="usageLimit">Global Usage Limit</label>
              <input
                type="number"
                id="usageLimit"
                name="usageLimit"
                value={couponData.usageLimit}
                onChange={handleChange}
                placeholder="e.g. 100 (Blank = Unlimited)"
                className="form-input"
                min="0"
              />
              {errors.usageLimit && <span className="form-error-msg">{errors.usageLimit}</span>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="perCustomerLimit">Usage Limit Per User</label>
              <input
                type="number"
                id="perCustomerLimit"
                name="perCustomerLimit"
                value={couponData.perCustomerLimit}
                onChange={handleChange}
                placeholder="e.g. 1"
                className="form-input"
                min="1"
              />
              {errors.perCustomerLimit && <span className="form-error-msg">{errors.perCustomerLimit}</span>}
            </div>
            <div className="form-group" style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginBottom: 0 }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none", marginTop: "24px" }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={couponData.isActive}
                  onChange={handleChange}
                  style={{ width: "18px", height: "18px", margin: 0 }}
                />
                <span className="form-label" style={{ margin: 0, fontWeight: 500 }}>Active and Redeemable</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="Delete Coupon"
        footer={
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              disabled={deleting}
              onClick={() => setDeleteModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteConfirm}
              className="btn btn-danger"
            >
              {deleting ? "Deleting..." : "Delete Coupon"}
            </button>
          </div>
        }
      >
        <p>Are you sure you want to permanently delete the coupon code <strong>{couponToDelete?.code}</strong>?</p>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
          This action cannot be undone. Customers will no longer be able to apply this coupon code.
        </p>
      </Modal>
    </div>
  );
};

export default Coupons;
