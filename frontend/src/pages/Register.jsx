import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Milk, Eye, EyeOff, Lock, Mail, User, Shield } from "lucide-react";

const Register = () => {
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("accountant");
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Validation checks
    if (!name.trim() || !email.trim() || !password) {
      setValidationError("Please fill in all fields");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, role);
      showSuccess("Account registered and logged in successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Registration failed. Try a different email.";
      setValidationError(errMsg);
      showError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Decorative Blur Background Elements */}
      <div className="login-bg-decor decor-1" />
      <div className="login-bg-decor decor-2" />

      <div className="login-card" style={{ maxWidth: "460px" }}>
        <div className="login-logo-section">
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "8px",
              overflow: "hidden"
            }}
          >
            <img src="/logo.png" alt="SLG MILK DAIRYS Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <h1 className="brand-name" style={{ fontSize: "1.75rem", textAlign: "center" }}>
            Create Account
          </h1>
          <p className="login-subtitle">SLG MILK DAIRYS Billing & Management</p>
        </div>

        {validationError && (
          <div
            style={{
              backgroundColor: "var(--color-danger-light)",
              color: "var(--color-danger)",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "20px",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              textAlign: "left"
            }}
          >
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name *
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <User
                size={16}
                color="var(--color-text-secondary)"
                style={{ position: "absolute", left: "12px", pointerEvents: "none" }}
              />
              <input
                id="name"
                type="text"
                placeholder="e.g. Bhargav Patel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "36px" }}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address *
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Mail
                size={16}
                color="var(--color-text-secondary)"
                style={{ position: "absolute", left: "12px", pointerEvents: "none" }}
              />
              <input
                id="email"
                type="email"
                placeholder="e.g. bhargav@dairy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "36px" }}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password *
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Lock
                size={16}
                color="var(--color-text-secondary)"
                style={{ position: "absolute", left: "12px", pointerEvents: "none" }}
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "36px", paddingRight: "40px" }}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
                tabIndex="-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Account Role selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="role">
              Access Role *
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Shield
                size={16}
                color="var(--color-text-secondary)"
                style={{ position: "absolute", left: "12px", pointerEvents: "none" }}
              />
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "36px" }}
                disabled={loading}
                required
              >
                <option value="accountant">Accountant (Billing Staff)</option>
                <option value="admin">Store Admin (Full Permissions)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", height: "46px", marginTop: "8px" }}
            disabled={loading}
          >
            {loading ? (
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid #ffffff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "loadingSkeleton 1s linear infinite"
                }}
              />
            ) : (
              "Sign Up & Login"
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "0.85rem",
            color: "var(--color-text-secondary)"
          }}
        >
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: 600, color: "var(--color-primary)" }}>
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
