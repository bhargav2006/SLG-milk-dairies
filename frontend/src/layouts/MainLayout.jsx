import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  LayoutDashboard,
  Milk,
  Receipt,
  Users as UsersIcon,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ShoppingBag
} from "lucide-react";

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    showSuccess("Logged out successfully");
    navigate("/login");
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path.startsWith("/products")) {
      if (path.includes("add")) return "Add Product";
      if (path.includes("edit")) return "Edit Product";
      return "Products Catalog";
    }
    if (path.startsWith("/orders")) return "Customer Orders Management";
    if (path.startsWith("/bills")) {
      if (path.includes("create")) return "POS Billing Terminal";
      return "Billing Log History";
    }
    if (path.startsWith("/billing/retail")) return "Retail Billing Terminal";
    if (path.startsWith("/billing/wholesale")) return "Wholesale Billing Terminal";
    if (path.startsWith("/users")) return "User Accounts Management";
    if (path.startsWith("/profile")) return "Account Profile";
    return "SRI LAKSHMI GANAPATHI MILK DAIRYS System";
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["admin", "accountant"] },
    { name: "Products", path: "/products", icon: Milk, roles: ["admin", "accountant"] },
    { name: "Bills", path: "/bills", icon: Receipt, roles: ["admin", "accountant"] },
    { name: "Orders", path: "/orders", icon: ShoppingBag, roles: ["admin", "accountant"] },
    { name: "Users", path: "/users", icon: UsersIcon, roles: ["admin"] },
    { name: "Profile", path: "/profile", icon: UserIcon, roles: ["admin", "accountant"] },
  ];

  // Render navigation links
  const renderLinks = () => {
    return menuItems
      .filter((item) => item.roles.includes(user?.role))
      .map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={20} className="sidebar-link-icon" />
              <span className="sidebar-link-text">{item.name}</span>
            </NavLink>
          </li>
        );
      });
  };

  const userInitials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  return (
    <div className="app-container">
      {/* Drawer Overlay for Mobile */}
      {isMobileOpen && (
        <div
          className="drawer-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop and Mobile Drawer */}
      <aside
        className={`sidebar ${isMobileOpen ? "open" : ""}`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <img src="/logo.png" alt="SRI LAKSHMI GANAPATHI MILK DAIRYS Logo" style={{ width: "28px", height: "28px", objectFit: "contain", borderRadius: "50%" }} />
          </div>
          <span className="brand-name" style={{ fontSize: "0.78rem", whiteSpace: "normal", lineHeight: "1.2", display: "flex", flexDirection: "column" }}>
            <span>SRI LAKSHMI GANAPATHI MILK DAIRYS</span>
            <span style={{ fontSize: "0.62rem", color: "var(--color-warning)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em", marginTop: "1px" }}>Visakha Dairy Partner</span>
          </span>
        </div>

        <ul className="sidebar-menu">
          {renderLinks()}
          <li style={{ marginTop: "auto" }} className="no-print">
            <a onClick={handleLogout} className="sidebar-link" style={{ color: "var(--color-danger)" }}>
              <LogOut size={20} />
              <span className="sidebar-link-text">Logout</span>
            </a>
          </li>
        </ul>
      </aside>

      {/* Main Panel wrapper */}
      <div className="main-content">
        {/* Sticky Top Header */}
        <header className="header no-print">
          <div className="header-left">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="mobile-menu-toggle"
              aria-label="Toggle navigation menu"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="page-title">{getPageTitle()}</h2>
          </div>

          <div className="header-right">
            <div className="user-profile-badge">
              <div className="user-avatar">{userInitials}</div>
              <div className="user-info">
                <span className="user-name">{user?.name || "User"}</span>
                <span className="user-role-tag">{user?.role || "Accountant"}</span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="logout-btn-header"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Dynamic Nested Screen Content */}
        <main className="page-container">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
