import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Skeleton } from "../components/common/Skeleton";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // If loading, display a premium loading layout matching the main theme
  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Mock Sidebar */}
        <div style={{ width: "260px", background: "#ffffff", borderRight: "1px solid #e5e7eb", padding: "24px" }}>
          <Skeleton style={{ height: "40px", width: "100%", marginBottom: "32px", borderRadius: "8px" }} />
          <Skeleton style={{ height: "24px", width: "80%", marginBottom: "16px", borderRadius: "6px" }} />
          <Skeleton style={{ height: "24px", width: "70%", marginBottom: "16px", borderRadius: "6px" }} />
          <Skeleton style={{ height: "24px", width: "85%", marginBottom: "16px", borderRadius: "6px" }} />
        </div>
        {/* Mock Body */}
        <div style={{ flexGrow: 1, padding: "24px", background: "#f8fafc" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <Skeleton style={{ height: "32px", width: "200px", borderRadius: "6px" }} />
            <Skeleton style={{ height: "32px", width: "120px", borderRadius: "16px" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "32px" }}>
            <Skeleton style={{ height: "100px", borderRadius: "12px" }} />
            <Skeleton style={{ height: "100px", borderRadius: "12px" }} />
            <Skeleton style={{ height: "100px", borderRadius: "12px" }} />
            <Skeleton style={{ height: "100px", borderRadius: "12px" }} />
          </div>
          <Skeleton style={{ height: "400px", width: "100%", borderRadius: "16px" }} />
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role verification check
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children/nested routes
  return <Outlet />;
};

export default ProtectedRoute;
