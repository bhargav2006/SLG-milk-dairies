import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import deliveryBoyService from "../services/deliveryBoyService";
import { Milk, Eye, EyeOff, Lock, Mail, Phone } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState("staff"); // "staff" or "delivery"
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (loginType === "staff") {
      // Simple validation for staff
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
        showSuccess("Welcome back to SRI LAKSHMI GANAPATHI MILK DAIRYS!");
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
    } else {
      // Delivery Boy login
      if (!phone || phone.length !== 10) {
        setValidationError("Please enter a valid 10-digit mobile number");
        return;
      }
      if (!password) {
        setValidationError("Please enter your password");
        return;
      }

      setLoading(true);
      try {
        const data = await deliveryBoyService.login(phone, password);
        if (data && data.token) {
          localStorage.setItem("delivery_token", data.token);
          localStorage.setItem("delivery_info", JSON.stringify(data.deliveryBoy));
          showSuccess("Welcome back to Delivery Partner Portal!");
          navigate("/delivery/dashboard");
        }
      } catch (err) {
        console.error(err);
        const errMsg =
          err.response?.data?.message || "Invalid credentials. Try again.";
        setValidationError(errMsg);
        showError(errMsg);
      } finally {
        setLoading(false);
      }
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
              alt="SRI LAKSHMI GANAPATHI MILK DAIRYS Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <h1
            className="brand-name"
            style={{ fontSize: "1.75rem", textAlign: "center", marginBottom: "2px" }}
          >
            SRI LAKSHMI GANAPATHI MILK DAIRYS
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#d97706", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", margin: "0 0 8px 0" }}>
            Visakha Dairy Partner
          </p>
          <p className="login-subtitle">Billing & Management System</p>
        </div>

        {/* Login Type Tabs Selector */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab-btn ${loginType === "staff" ? "active" : ""}`}
            onClick={() => {
              setLoginType("staff");
              setValidationError("");
            }}
          >
            Staff Login (Admin/Accountant)
          </button>
          <button
            type="button"
            className={`login-tab-btn ${loginType === "delivery" ? "active" : ""}`}
            onClick={() => {
              setLoginType("delivery");
              setValidationError("");
            }}
          >
            Delivery Partner
          </button>
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
          {loginType === "staff" ? (
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
          ) : (
            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Mobile Number
              </label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Phone
                  size={16}
                  color="var(--color-text-secondary)"
                  style={{
                    position: "absolute",
                    left: "12px",
                    pointerEvents: "none",
                  }}
                />
                <input
                  id="phone"
                  type="tel"
                  placeholder="10-Digit Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: "36px" }}
                  maxLength="10"
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

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
            ) : loginType === "staff" ? (
              "Sign In"
            ) : (
              "Sign In as Partner"
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Link to="/" style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: "0.85rem", textDecoration: "underline" }}>
            Back to Public Shop
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
