import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import userService from "../services/userService";
import { TableSkeleton } from "../components/common/Skeleton";
import Modal from "../components/common/Modal";
import EmptyState from "../components/common/EmptyState";
import { Users as UsersIcon, Trash2, ShieldCheck, UserCheck } from "lucide-react";

const Users = () => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete User Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
          User Accounts Management
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          Admin panel to review register credentials and manage store access.
        </p>
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
                      {user._id === currentUser._id ? (
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", fontStyle: "italic" }}>
                          Current Session
                        </span>
                      ) : (
                        <button
                          onClick={() => triggerDeleteUser(user)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: "6px" }}
                          title="Delete User Account"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
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
    </div>
  );
};

export default Users;
