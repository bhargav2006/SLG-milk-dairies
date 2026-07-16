import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import userService from "../services/userService";
import deliveryBoyService from "../services/deliveryBoyService";
import { TableSkeleton } from "../components/common/Skeleton";
import Modal from "../components/common/Modal";
import EmptyState from "../components/common/EmptyState";
import { Users as UsersIcon, Trash2, ShieldCheck, UserCheck, Edit, Plus, Truck, MapPin } from "lucide-react";

const Users = () => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState("staff"); // "staff" or "delivery"
  const [users, setUsers] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete User Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // Can be a User or DeliveryBoy object
  const [deleting, setDeleting] = useState(false);

  // Add/Edit User Modal State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "accountant",
    phone: "",
  });
  const [userErrors, setUserErrors] = useState({});
  const [submittingUser, setSubmittingUser] = useState(false);

  // Add/Edit Delivery Boy Modal State
  const [dboyModalOpen, setDboyModalOpen] = useState(false);
  const [editingDboy, setEditingDboy] = useState(null);
  const [dboyData, setDboyData] = useState({
    name: "",
    phone: "",
    password: "",
    street: "",
    city: "",
    isAvailable: true,
    isActive: true,
  });
  const [dboyErrors, setDboyErrors] = useState({});
  const [submittingDboy, setSubmittingDboy] = useState(false);

  // Fetch all staff users
  const loadUsers = useCallback(async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      showError("Failed to fetch user accounts.");
    }
  }, [showError]);

  // Fetch all delivery boys
  const loadDeliveryBoys = useCallback(async () => {
    try {
      const data = await deliveryBoyService.adminGetDeliveryBoys();
      setDeliveryBoys(data || []);
    } catch (err) {
      console.error(err);
      showError("Failed to fetch delivery partners.");
    }
  }, [showError]);

  // Unified load dashboard
  const loadData = useCallback(async () => {
    setLoading(true);
    if (activeTab === "staff") {
      await loadUsers();
    } else {
      await loadDeliveryBoys();
    }
    setLoading(false);
  }, [activeTab, loadUsers, loadDeliveryBoys]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // STAFF ACTIONS
  const handleOpenAddUserModal = () => {
    setEditingUser(null);
    setUserData({
      name: "",
      email: "",
      password: "",
      role: "accountant",
      phone: "",
    });
    setUserErrors({});
    setUserModalOpen(true);
  };

  const handleOpenEditUserModal = (usr) => {
    setEditingUser(usr);
    setUserData({
      name: usr.name || "",
      email: usr.email || "",
      password: "",
      role: usr.role || "accountant",
      phone: usr.phone || "",
    });
    setUserErrors({});
    setUserModalOpen(true);
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    if (userErrors[name]) {
      setUserErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateUserForm = () => {
    const errors = {};
    if (!userData.name.trim()) errors.name = "Name is required";
    
    if (!userData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = "Email is invalid";
    }

    if (!editingUser && !userData.password) {
      errors.password = "Password is required";
    } else if (userData.password && userData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!validateUserForm()) return;

    setSubmittingUser(true);
    try {
      const payload = {
        name: userData.name.trim(),
        email: userData.email.trim(),
        role: userData.role,
        phone: userData.phone.trim(),
      };
      if (userData.password) {
        payload.password = userData.password;
      }

      if (editingUser) {
        await userService.updateUser(editingUser._id, payload);
        showSuccess(`Account for ${userData.name} updated successfully!`);
      } else {
        await userService.createUser(payload);
        showSuccess(`Account for ${userData.name} created successfully!`);
      }
      setUserModalOpen(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "An error occurred while saving user.");
    } finally {
      setSubmittingUser(false);
    }
  };

  // DELIVERY BOY ACTIONS
  const handleOpenAddDboyModal = () => {
    setEditingDboy(null);
    setDboyData({
      name: "",
      phone: "",
      password: "",
      street: "",
      city: "",
      isAvailable: true,
      isActive: true,
    });
    setDboyErrors({});
    setDboyModalOpen(true);
  };

  const handleOpenEditDboyModal = (boy) => {
    setEditingDboy(boy);
    setDboyData({
      name: boy.name || "",
      phone: boy.phone || "",
      password: "",
      street: boy.currentLocation?.street || "",
      city: boy.currentLocation?.city || "",
      isAvailable: boy.isAvailable !== false,
      isActive: boy.isActive !== false,
    });
    setDboyErrors({});
    setDboyModalOpen(true);
  };

  const handleDboyChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setDboyData((prev) => ({ ...prev, [name]: val }));
    if (dboyErrors[name]) {
      setDboyErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateDboyForm = () => {
    const errors = {};
    if (!dboyData.name.trim()) errors.name = "Name is required";
    
    if (!dboyData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (dboyData.phone.trim().length !== 10 || !/^\d+$/.test(dboyData.phone)) {
      errors.phone = "Enter a valid 10-digit phone number";
    }

    if (!editingDboy && !dboyData.password) {
      errors.password = "Password is required";
    } else if (dboyData.password && dboyData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!dboyData.street.trim()) errors.street = "Street address is required";
    if (!dboyData.city.trim()) errors.city = "City is required";

    setDboyErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDboySubmit = async (e) => {
    e.preventDefault();
    if (!validateDboyForm()) return;

    setSubmittingDboy(true);
    try {
      const payload = {
        name: dboyData.name.trim(),
        phone: dboyData.phone.trim(),
        currentLocation: {
          street: dboyData.street.trim(),
          city: dboyData.city.trim(),
        },
        isAvailable: dboyData.isAvailable,
        isActive: dboyData.isActive,
      };
      if (dboyData.password) {
        payload.password = dboyData.password;
      }

      if (editingDboy) {
        await deliveryBoyService.adminUpdateDeliveryBoy(editingDboy._id, payload);
        showSuccess(`Delivery partner ${dboyData.name} updated successfully!`);
      } else {
        await deliveryBoyService.adminCreateDeliveryBoy(payload);
        showSuccess(`Delivery partner ${dboyData.name} registered successfully!`);
      }
      setDboyModalOpen(false);
      loadDeliveryBoys();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "An error occurred while saving delivery boy.");
    } finally {
      setSubmittingDboy(false);
    }
  };

  // DELETE CONFIRMATION
  const triggerDelete = (item) => {
    if (activeTab === "staff" && item._id === currentUser._id) {
      showInfo("You cannot delete your own logged-in account!");
      return;
    }
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      if (activeTab === "staff") {
        await userService.deleteUser(itemToDelete._id);
        showSuccess(`Staff account for ${itemToDelete.name} has been removed.`);
        loadUsers();
      } else {
        await deliveryBoyService.adminDeleteDeliveryBoy(itemToDelete._id);
        showSuccess(`Delivery partner ${itemToDelete.name} deleted successfully.`);
        loadDeliveryBoys();
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to remove user account.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Page Header & Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
            User Accounts & Workforce Management
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
            Admin panel to register staff accounts and manage delivery boys.
          </p>
        </div>
        <button
          onClick={activeTab === "staff" ? handleOpenAddUserModal : handleOpenAddDboyModal}
          className="btn btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} />
          {activeTab === "staff" ? "Add New User" : "Add Delivery Partner"}
        </button>
      </div>

      {/* Tabs Selector */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--color-border)", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("staff")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "staff" ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: activeTab === "staff" ? "var(--color-primary)" : "var(--color-text-secondary)",
            padding: "8px 16px",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
            outline: "none"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <UsersIcon size={16} />
            Staff Accounts
          </div>
        </button>
        <button
          onClick={() => setActiveTab("delivery")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "delivery" ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: activeTab === "delivery" ? "var(--color-primary)" : "var(--color-text-secondary)",
            padding: "8px 16px",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
            outline: "none"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Truck size={16} />
            Delivery Partners
          </div>
        </button>
      </div>

      {/* Main Content Workspace */}
      {loading ? (
        <div className="card-panel">
          <TableSkeleton rows={4} cols={4} />
        </div>
      ) : activeTab === "staff" ? (
        /* STAFF LIST TABLE */
        users.length === 0 ? (
          <EmptyState title="No Staff Registered" subtitle="Register system users to get started." icon={UsersIcon} />
        ) : (
          <div className="card-panel">
            <div className="table-wrapper">
              <table className="custom-table responsive-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Mobile Number</th>
                    <th>Role Permissions</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((usr) => (
                    <tr key={usr._id}>
                      <td data-label="Name" style={{ fontWeight: 600 }}>{usr.name}</td>
                      <td data-label="Email Address">{usr.email}</td>
                      <td data-label="Mobile Number">{usr.phone || "N/A"}</td>
                      <td data-label="Role Permissions">
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          {usr.role === "admin" ? (
                            <span style={{ fontSize: "0.75rem", fontWeight: 600, backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", padding: "2px 8px", borderRadius: "12px" }}>
                              <ShieldCheck size={12} style={{ marginRight: "4px" }} /> Admin
                            </span>
                          ) : (
                            <span style={{ fontSize: "0.75rem", fontWeight: 600, backgroundColor: "var(--color-success-light)", color: "var(--color-success)", padding: "2px 8px", borderRadius: "12px" }}>
                              <UserCheck size={12} style={{ marginRight: "4px" }} /> Accountant
                            </span>
                          )}
                        </div>
                      </td>
                      <td data-label="Actions" style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "6px", justifyContent: "center", width: "100%" }}>
                          <button
                            onClick={() => handleOpenEditUserModal(usr)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: "6px" }}
                            title="Edit User Account"
                          >
                            <Edit size={14} />
                          </button>
                          {usr._id !== currentUser._id && (
                            <button
                              onClick={() => triggerDelete(usr)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: "6px" }}
                              title="Delete User Account"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* DELIVERY BOY LIST TABLE */
        deliveryBoys.length === 0 ? (
          <EmptyState title="No Delivery Partners Registered" subtitle="Add delivery boys using the model schema fields." icon={Truck} />
        ) : (
          <div className="card-panel">
            <div className="table-wrapper">
              <table className="custom-table responsive-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone Number</th>
                    <th>Current Address</th>
                    <th>Availability</th>
                    <th>Portal Access</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryBoys.map((boy) => (
                    <tr key={boy._id}>
                      <td data-label="Name" style={{ fontWeight: 600 }}>{boy.name}</td>
                      <td data-label="Phone Number">{boy.phone}</td>
                      <td data-label="Current Address">
                        <div style={{ display: "inline-flex", alignItems: "flex-start", gap: "4px", fontSize: "0.85rem" }}>
                          <MapPin size={12} style={{ color: "#ef4444", marginTop: "2px", flexShrink: 0 }} />
                          {boy.currentLocation?.street}, {boy.currentLocation?.city}
                        </div>
                      </td>
                      <td data-label="Availability">
                        {boy.isAvailable ? (
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, backgroundColor: "#ecfdf5", color: "#065f46", padding: "2px 6px", borderRadius: "4px" }}>
                            AVAILABLE
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, backgroundColor: "#f3f4f6", color: "#374151", padding: "2px 6px", borderRadius: "4px" }}>
                            BUSY/OFFLINE
                          </span>
                        )}
                      </td>
                      <td data-label="Portal Access">
                        {boy.isActive ? (
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, backgroundColor: "#eff6ff", color: "#1e40af", padding: "2px 6px", borderRadius: "4px" }}>
                            ACTIVE
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, backgroundColor: "#fef2f2", color: "#dc2626", padding: "2px 6px", borderRadius: "4px" }}>
                            DISABLED
                          </span>
                        )}
                      </td>
                      <td data-label="Actions" style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "6px", justifyContent: "center", width: "100%" }}>
                          <button
                            onClick={() => handleOpenEditDboyModal(boy)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: "6px" }}
                            title="Edit Partner Details"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => triggerDelete(boy)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: "6px" }}
                            title="Delete Partner"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="Revoke Store Access"
        footer={
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              disabled={deleting}
              onClick={() => setDeleteModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              disabled={deleting}
              onClick={handleDeleteConfirm}
              className="btn btn-danger"
            >
              {deleting ? "Revoking..." : "Confirm Revocation"}
            </button>
          </div>
        }
      >
        {itemToDelete && (
          <div>
            <p style={{ fontSize: "0.95rem" }}>
              Are you sure you want to delete the {activeTab === "staff" ? "user account" : "delivery boy"} for <strong>"{itemToDelete.name}"</strong>?
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--color-danger)", marginTop: "8px", fontWeight: 500 }}>
              Warning: This action is permanent and will immediately block them from signing into the system.
            </p>
          </div>
        )}
      </Modal>

      {/* Staff Modal */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => !submittingUser && setUserModalOpen(false)}
        title={editingUser ? "Edit Staff User" : "Create New Staff User"}
        footer={
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              disabled={submittingUser}
              onClick={() => setUserModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submittingUser}
              onClick={handleUserSubmit}
              className="btn btn-primary"
            >
              {submittingUser ? "Saving..." : editingUser ? "Save Changes" : "Create Account"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleUserSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="user-name">Name *</label>
            <input
              id="user-name"
              name="name"
              type="text"
              className="form-input"
              value={userData.name}
              onChange={handleUserChange}
              disabled={submittingUser}
            />
            {userErrors.name && <span className="form-error-msg">{userErrors.name}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="user-email">Email Address *</label>
            <input
              id="user-email"
              name="email"
              type="email"
              className="form-input"
              value={userData.email}
              onChange={handleUserChange}
              disabled={submittingUser}
            />
            {userErrors.email && <span className="form-error-msg">{userErrors.email}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="user-phone">Mobile Number</label>
            <input
              id="user-phone"
              name="phone"
              type="text"
              className="form-input"
              placeholder="e.g. 9876543210"
              value={userData.phone || ""}
              onChange={handleUserChange}
              disabled={submittingUser}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="user-role">Role Permissions *</label>
            <select
              id="user-role"
              name="role"
              className="form-input"
              value={userData.role}
              onChange={handleUserChange}
              disabled={submittingUser || (editingUser && editingUser._id === currentUser._id)}
            >
              <option value="accountant">Accountant</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="user-password">
              Password {editingUser ? "(Leave blank to keep current)" : "*"}
            </label>
            <input
              id="user-password"
              name="password"
              type="password"
              className="form-input"
              placeholder={editingUser ? "••••••••" : "Minimum 6 characters"}
              value={userData.password}
              onChange={handleUserChange}
              disabled={submittingUser}
            />
            {userErrors.password && <span className="form-error-msg">{userErrors.password}</span>}
          </div>
        </form>
      </Modal>

      {/* Delivery Boy Modal */}
      <Modal
        isOpen={dboyModalOpen}
        onClose={() => !submittingDboy && setDboyModalOpen(false)}
        title={editingDboy ? "Edit Delivery Partner" : "Register Delivery Partner"}
        footer={
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              disabled={submittingDboy}
              onClick={() => setDboyModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submittingDboy}
              onClick={handleDboySubmit}
              className="btn btn-primary"
            >
              {submittingDboy ? "Saving..." : editingDboy ? "Save Changes" : "Register Partner"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleDboySubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Name */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="dboy-name">Partner Name *</label>
            <input
              id="dboy-name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Full Name"
              value={dboyData.name}
              onChange={handleDboyChange}
              disabled={submittingDboy}
            />
            {dboyErrors.name && <span className="form-error-msg">{dboyErrors.name}</span>}
          </div>

          {/* Phone */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="dboy-phone">Mobile Phone Number *</label>
            <input
              id="dboy-phone"
              name="phone"
              type="tel"
              className="form-input"
              placeholder="10-Digit Mobile Number"
              value={dboyData.phone}
              onChange={handleDboyChange}
              maxLength="10"
              disabled={submittingDboy}
            />
            {dboyErrors.phone && <span className="form-error-msg">{dboyErrors.phone}</span>}
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="dboy-password">
              Access Password {editingDboy ? "(Leave blank to keep current)" : "*"}
            </label>
            <input
              id="dboy-password"
              name="password"
              type="password"
              className="form-input"
              placeholder={editingDboy ? "••••••••" : "Minimum 6 characters"}
              value={dboyData.password}
              onChange={handleDboyChange}
              disabled={submittingDboy}
            />
            {dboyErrors.password && <span className="form-error-msg">{dboyErrors.password}</span>}
          </div>

          {/* Current Location Address */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="dboy-street">Street Address *</label>
              <input
                id="dboy-street"
                name="street"
                type="text"
                className="form-input"
                placeholder="e.g. Ward-3 main road"
                value={dboyData.street}
                onChange={handleDboyChange}
                disabled={submittingDboy}
              />
              {dboyErrors.street && <span className="form-error-msg">{dboyErrors.street}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="dboy-city">City *</label>
              <input
                id="dboy-city"
                name="city"
                type="text"
                className="form-input"
                placeholder="e.g. Visakhapatnam"
                value={dboyData.city}
                onChange={handleDboyChange}
                disabled={submittingDboy}
              />
              {dboyErrors.city && <span className="form-error-msg">{dboyErrors.city}</span>}
            </div>
          </div>

          {/* Toggle Checks for edit */}
          {editingDboy && (
            <div style={{ display: "flex", gap: "20px", marginTop: "4px" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={dboyData.isAvailable}
                  onChange={handleDboyChange}
                  disabled={submittingDboy}
                />
                Available for Duty
              </label>

              <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={dboyData.isActive}
                  onChange={handleDboyChange}
                  disabled={submittingDboy}
                />
                Portal Access Active
              </label>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Users;
