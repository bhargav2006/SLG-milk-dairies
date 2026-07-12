import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import deliveryBoyService from "../services/deliveryBoyService";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import "./DeliveryLogin.css";

const DeliveryLogin = () => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.length !== 10) {
      showError("Please enter a valid 10-digit phone number");
      return;
    }
    if (!password) {
      showError("Please enter your password");
      return;
    }

    try {
      setLoading(true);
      const data = await deliveryBoyService.login(phone, password);
      if (data && data.token) {
        localStorage.setItem("delivery_token", data.token);
        localStorage.setItem("delivery_info", JSON.stringify(data.deliveryBoy));
        showSuccess("Logged in successfully!");
        navigate("/delivery/dashboard");
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Invalid credentials. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="db-login-root">
      <div className="db-login-card">
        <div className="db-login-header">
          <img src="/logo.png" alt="SLG Logo" className="db-logo" />
          <h3>Delivery Partner Portal</h3>
          <p>Sign in to view your assigned orders and run deliveries.</p>
        </div>

        <form onSubmit={handleSubmit} className="db-login-form">
          <div className="db-form-group">
            <label htmlFor="dbPhone">Mobile Number</label>
            <div className="db-input-wrapper">
              <Phone size={18} className="input-icon" />
              <input
                type="tel"
                id="dbPhone"
                placeholder="10-Digit Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength="10"
                required
              />
            </div>
          </div>

          <div className="db-form-group">
            <label htmlFor="dbPassword">Password</label>
            <div className="db-input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="dbPassword"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="pwd-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="db-login-submit-btn">
            {loading ? "Authenticating..." : "Sign In to Portal"}
          </button>
        </form>

        <div className="db-login-footer">
          <p>Sri Lakshmi Ganapathi Milk and Cool Drinks</p>
          <button onClick={() => navigate("/")} className="back-home-link">
            Back to Public Shop
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryLogin;
