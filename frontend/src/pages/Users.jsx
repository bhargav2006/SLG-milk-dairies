import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import userService from "../services/userService";
import { TableSkeleton } from "../components/common/Skeleton";
import Modal from "../components/common/Modal";
import EmptyState from "../components/common/EmptyState";
import { Users as UsersIcon, Trash2, ShieldCheck, UserCheck, Edit, Plus } from "lucide-react";

const Users = () => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete User Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Add/Edit User Modal State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "accountant",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submittingForm, setSubmittingForm] = useState(false);

  // Fetch all accounts
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      showError("Failed to fetch user accounts.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const triggerDeleteUser = (user) => {
    if (user._id === currentUser._id) {
      showInfo("You cannot delete your own logged-in account!");
      return;
    }
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await userService.deleteUser(userToDelete._id);
      showSuccess(`Account for ${userToDelete.name} has been removed.`);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to delete user account.";
      showError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "accountant",
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "accountant",
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!editingUser && !formData.password) {
      errors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmittingForm(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingUser) {
        await userService.updateUser(editingUser._id, payload);
        showSuccess(`Account for ${formData.name} updated successfully!`);
      } else {
        await userService.createUser(payload);
        showSuccess(`Account for ${formData.name} created successfully!`);
      }
      setFormModalOpen(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "An error occurred while saving.";
      showError(msg);
    } finally {
      setSubmittingForm(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
            User Accounts Management
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
            Admin panel to review register credentials and manage store access.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} />
          Add New User
        </button>
      </div>

      {/* Main Table Panel */}
      {loading ? (
        <div className="card-panel">
          <TableSkeleton rows={4} cols={4} />
        </div>
      ) : users.length === 0 ? (
        <EmptyState title="No Users Registered" subtitle="Create accounts externally to list users." icon={UsersIcon} />
      ) : (
        <div className="card-panel">
          <div className="table-wrapper">
            <table className="custom-table responsive-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email Address</th>
                  <th>Role Permissions</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td data-label="Name" style={{ fontWeight: 600 }}>{user.name}</td>
                    <td data-label="Email Address">{user.email}</td>
                    <td data-label="Role Permissions">
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        {user.role === "admin" ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              backgroundColor: "var(--color-primary-light)",
                              color: "var(--color-primary)",
                              padding: "2px 8px",
                              borderRadius: "12px"
                            }}
                          >
                            <ShieldCheck size={12} />
                            Admin
                          </span>
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              backgroundColor: "var(--color-success-light)",
                              color: "var(--color-success)",
                              padding: "2px 8px",
                              borderRadius: "12px"
                            }}
                          >
                            <UserCheck size={12} />
                            Accountant
                          </span>
                        )}
                      </div>
                    </td>
                    <td data-label="Actions" style={{ textAlign: "center" }}>
                      <div style={{ display: "inline-flex", gap: "6px", justifyContent: "center", width: "100%" }}>
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "6px" }}
                          title="Edit User Account"
                        >
                          <Edit size={14} />
                        </button>
                        {user._id !== currentUser._id && (
                          <button
                            onClick={() => triggerDeleteUser(user)}
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
        {userToDelete && (
          <div>
            <p style={{ fontSize: "0.95rem" }}>
              Are you sure you want to delete the user account for <strong>"{userToDelete.name}"</strong> (
              {userToDelete.email})?
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--color-danger)", marginTop: "8px", fontWeight: 500 }}>
              Warning: This will immediately revoke their access token and block them from logging into this POS.
            </p>
          </div>
        )}
      </Modal>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => !submittingForm && setFormModalOpen(false)}
        title={editingUser ? "Edit User Account" : "Create New User"}
        footer={
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              disabled={submittingForm}
              onClick={() => setFormModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submittingForm}
              onClick={handleFormSubmit}
              className="btn btn-primary"
            >
              {submittingForm ? "Saving..." : editingUser ? "Save Changes" : "Create Account"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Name */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="form-name">Name *</label>
            <input
              id="form-name"
              name="name"
              type="text"
              className="form-input"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleFormChange}
              disabled={submittingForm}
            />
            {formErrors.name && <span className="form-error-msg">{formErrors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="form-email">Email Address *</label>
            <input
              id="form-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="e.g. name@example.com"
              value={formData.email}
              onChange={handleFormChange}
              disabled={submittingForm}
            />
            {formErrors.email && <span className="form-error-msg">{formErrors.email}</span>}
          </div>

          {/* Role */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="form-role">Role Permissions *</label>
            <select
              id="form-role"
              name="role"
              className="form-input"
              value={formData.role}
              onChange={handleFormChange}
              disabled={submittingForm || (editingUser && editingUser._id === currentUser._id)}
            >
              <option value="accountant">Accountant</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="form-password">
              Password {editingUser ? "(Leave blank to keep current)" : "*"}
            </label>
            <input
              id="form-password"
              name="password"
              type="password"
              className="form-input"
              placeholder={editingUser ? "••••••••" : "Minimum 6 characters"}
              value={formData.password}
              onChange={handleFormChange}
              disabled={submittingForm}
            />
            {formErrors.password && <span className="form-error-msg">{formErrors.password}</span>}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
