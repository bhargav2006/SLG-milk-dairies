import React from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, User } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
          My Profile Account
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          Review your account profile details and access privileges.
        </p>
      </div>

      {/* Profile Card details */}
      <div className="profile-card">
        <div className="profile-header-accent">
          <div className="profile-avatar-large">{userInitials}</div>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              {user?.name}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
              {user?.role === "admin" ? <Shield size={14} color="var(--color-primary)" /> : <User size={14} color="var(--color-success)" />}
              <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{user?.role} Access Role</span>
            </p>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="profile-detail-item">
            <span className="profile-detail-label">Full Name</span>
            <span className="profile-detail-value">{user?.name || "N/A"}</span>
          </div>

          <div className="profile-detail-item">
            <span className="profile-detail-label">Email Address</span>
            <span className="profile-detail-value">{user?.email || "N/A"}</span>
          </div>

          <div className="profile-detail-item">
            <span className="profile-detail-label">Access Level</span>
            <span className="profile-detail-value" style={{ textTransform: "uppercase", fontSize: "0.9rem", color: "var(--color-primary)" }}>
              {user?.role}
            </span>
          </div>

          <div className="profile-detail-item">
            <span className="profile-detail-label">Account Status</span>
            <span className="profile-detail-value" style={{ color: "var(--color-success)" }}>
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
