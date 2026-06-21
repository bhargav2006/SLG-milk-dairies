import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Milk, Eye, EyeOff, Lock, Mail } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Simple validation
    if (!email || !password) {
      setValidationError("Please fill in all fields");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showSuccess("Welcome back to SRI LAKSHMI GANAPATHI MILK AND COOL DRINKS!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const errMsg =
        err.response?.data?.message || "Invalid credentials or server error";
      setValidationError(errMsg);
      showError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Decorative Blur Elements */}
      <div className="login-bg-decor decor-1" />
      <div className="login-bg-decor decor-2" />

      <div className="login-card">
        <div className="login-logo-section">
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "var(--color-primary-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-primary)",
              marginBottom: "8px",
            }}
          >
            <img
              src="/logo.png"
              alt="SRI LAKSHMI GANAPATHI MILK AND COOL DRINKS Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <h1
            className="brand-name"
            style={{ fontSize: "1.75rem", textAlign: "center" }}
          >
            SRI LAKSHMI GANAPATHI MILK AND COOL DRINKS
          </h1>
          <p className="login-subtitle">Billing & Management System</p>
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
              textAlign: "left",
            }}
          >
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Mail
                size={16}
                color="var(--color-text-secondary)"
                style={{
                  position: "absolute",
                  left: "12px",
                  pointerEvents: "none",
                }}
              />
              <input
                id="email"
                type="email"
                placeholder="owner@dairy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "36px" }}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Lock
                size={16}
                color="var(--color-text-secondary)"
                style={{
                  position: "absolute",
                  left: "12px",
                  pointerEvents: "none",
                }}
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
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
                  animation: "loadingSkeleton 1s linear infinite",
                }}
              />
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
