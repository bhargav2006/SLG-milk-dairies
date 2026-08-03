import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Info,
  CheckCircle,
  Check,
  Upload,
  QrCode,
  CreditCard,
  Image as ImageIcon
} from "lucide-react";
import qrScannerImg from "../../assets/QR_SCANNER.jpeg";

const CheckoutDrawer = ({
  isOpen,
  onClose,
  onGoBackToCart,
  customerToken,
  customerInfo,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  otp,
  setOtp,
  otpSent,
  setOtpSent,
  isRegistered,
  otpVerifying,
  handleSendOtp,
  handleVerifyOtp,
  tempOtp,
  handlePlaceOrder,
  addresses,
  selectedAddressIndex,
  setSelectedAddressIndex,
  newAddress,
  setNewAddress,
  deliveryNotes,
  setDeliveryNotes,
  cartSubtotal,
  deliveryFee,
  cartTotal,
  isSubmittingOrder,
  placedOrder,
  setPlacedOrder,
  handleOpenOrdersHistory,
  handleDirectLogin,
  couponCode,
  setCouponCode,
  appliedCoupon,
  setAppliedCoupon,
  discountAmount,
  setDiscountAmount,
  couponError,
  setCouponError,
  applyingCoupon,
  setApplyingCoupon,
  handleApplyCoupon,
  handleRemoveCoupon,
}) => {
  const navigate = useNavigate();

  // Payment states for Scan & Pay (QR)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [uploadError, setUploadError] = useState("");

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file (PNG, JPG, JPEG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size is too large. Please upload an image under 10MB.");
      return;
    }

    setUploadError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
        setPaymentScreenshot(compressedBase64);
        setScreenshotPreview(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const onSubmitCheckoutForm = (e) => {
    e.preventDefault();
    if (selectedPaymentMethod === "QR_PAYMENT") {
      if (!paymentScreenshot && !transactionId.trim()) {
        setUploadError("Please upload payment screenshot or enter Transaction ID / UTR.");
        return;
      }
    }
    handlePlaceOrder(e, {
      paymentMethod: selectedPaymentMethod,
      paymentProofScreenshot: paymentScreenshot,
      transactionId: transactionId.trim(),
    });
  };

  if (!isOpen) return null;

  // Determine current active step index (OTP verification is bypassed):
  /*
  // Steps: Cart (0), Details (1), Verification (2), Delivery (3), Confirm (4), Done (5)
  const getActiveStep = () => {
    if (placedOrder) return 5; // Done
    if (!customerToken) {
      if (!otpSent) return 1; // Details
      return 2; // Verification
    }
    // Authenticated, check address selection
    if (
      selectedAddressIndex === -1 &&
      (!newAddress.street || !newAddress.pincode)
    ) {
      return 3; // Delivery selection
    }
    return 4; // Confirm
  };

  const activeStep = getActiveStep();
  const steps = [
    { label: "Cart", index: 0 },
    { label: "Details", index: 1 },
    { label: "Verification", index: 2 },
    { label: "Delivery", index: 3 },
    { label: "Confirm", index: 4 },
    { label: "Done", index: 5 },
  ];
  */

  // Steps: Cart (0), Details (1), Delivery (2), Confirm (3), Done (4)
  const getActiveStep = () => {
    if (placedOrder) return 4; // Done
    if (!customerToken) {
      return 1; // Details
    }
    // Authenticated, check address selection
    if (
      selectedAddressIndex === -1 &&
      (!newAddress.street || !newAddress.pincode)
    ) {
      return 2; // Delivery selection
    }
    return 3; // Confirm
  };

  const activeStep = getActiveStep();
  const steps = [
    { label: "Cart", index: 0 },
    { label: "Details", index: 1 },
    { label: "Delivery", index: 2 },
    { label: "Confirm", index: 3 },
    { label: "Done", index: 4 },
  ];

  return (
    <div
      className="lp-modal-overlay show"
      onClick={onClose}
      style={{ zIndex: 1050 }}>
      <div className="lp-checkout-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="lp-drawer-header">
          <button
            type="button"
            onClick={() => {
              // console.log(
              //   "[Checkout Debug] checkout back button clicked -> onGoBackToCart",
              // );
              onGoBackToCart();
            }}
            className="checkout-back-btn"
            aria-label="Go back to cart">
            <ArrowLeft size={16} />
            <span>Back to Cart</span>
          </button>
          <h3>Secure Checkout</h3>
          <button
            onClick={() => {
              // console.log(
              //   "[Checkout Debug] checkout close button clicked -> onClose",
              // );
              onClose();
            }}
            className="close-drawer-btn"
            aria-label="Close checkout">
            <X size={20} />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="lp-checkout-progress-bar">
          {steps.map((st) => (
            <div
              key={st.index}
              className={`lp-step-node ${activeStep === st.index ? "active" : ""} ${
                activeStep > st.index ? "completed" : ""
              }`}>
              <div className="node-circle">
                {activeStep > st.index ? <Check size={12} /> : st.index}
              </div>
              <span className="node-label">{st.label}</span>
              {/* Originally index < 5, changed to < 4 since OTP step is bypassed */}
              {st.index < 4 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>

        {/* Checkout Steps Render */}
        {/* Originally activeStep === 5, changed to === 4 since OTP step is bypassed */}
        {activeStep === 4 && placedOrder ? (
          /* Order Success Page */
          <div className="lp-success-screen lp-fade-in">
            <div className="success-icon-wrapper">
              <CheckCircle size={56} className="success-icon" />
            </div>
            <h4>Order Placed Successfully!</h4>
            <p className="success-sub">
              Estimated Delivery Time: <strong>30–45 Minutes</strong>
            </p>

            <div className="success-receipt-details">
              <div className="receipt-row">
                <span>Order Number:</span>
                <strong>{placedOrder.OrderNumber}</strong>
              </div>
              <div className="receipt-row">
                <span>Subtotal:</span>
                <strong>₹{placedOrder.subtotal}</strong>
              </div>
              {placedOrder.couponCode && (
                <div className="receipt-row" style={{ color: "var(--color-danger)" }}>
                  <span>Coupon Discount ({placedOrder.couponCode}):</span>
                  <strong>-₹{placedOrder.discountAmount}</strong>
                </div>
              )}
              <div className="receipt-row">
                <span>Delivery Fee:</span>
                <strong>₹{placedOrder.deliveryFee}</strong>
              </div>
              <div className="receipt-row">
                <span>Grand Total:</span>
                <strong>₹{placedOrder.totalAmount}</strong>
              </div>
              <div className="receipt-row">
                <span>Payment Mode:</span>
                <strong>Cash on Delivery (COD)</strong>
              </div>
              <div className="receipt-address">
                <h5>Delivering To:</h5>
                <p>
                  {placedOrder.address.houseNo
                    ? `${placedOrder.address.houseNo}, `
                    : ""}
                  {placedOrder.address.street}, {placedOrder.address.city} -{" "}
                  {placedOrder.address.pincode}
                </p>
              </div>
            </div>

            <div className="success-actions">
              <button
                onClick={() => {
                  setPlacedOrder(null);
                  onClose();
                  navigate("/track-orders");
                }}
                className="lp-btn lp-btn-primary lp-btn-block">
                Track Order
              </button>
              <button
                onClick={() => {
                  setPlacedOrder(null);
                  onClose();
                }}
                className="lp-btn lp-btn-secondary lp-btn-block">
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Step Forms */
          <div className="lp-checkout-scroll-content">
            {/* --- BYPASSED OTP FLOW --- */}
            {!customerToken && (
              <form
                onSubmit={handleDirectLogin}
                className="lp-checkout-form-step lp-fade-in">
                <h4>Customer Sign In</h4>
                <p className="checkout-step-desc">
                  Enter your phone number to sign in and prepare order delivery.
                </p>

                <div className="lp-form-group">
                  <label htmlFor="checkoutPhone">Mobile Number *</label>
                  <input
                    type="tel"
                    id="checkoutPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-Digit Mobile Number"
                    maxLength="10"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={otpVerifying}
                  className="lp-btn lp-btn-primary lp-btn-block form-action-btn">
                  {otpVerifying ? "Proceeding..." : "Continue to Delivery"}
                </button>

                <button
                  type="button"
                  onClick={onGoBackToCart}
                  className="lp-btn lp-btn-secondary lp-btn-block form-back-btn">
                  Go Back to Cart
                </button>
              </form>
            )}

            {/* ORIGINAL OTP FLOW (COMMENTED OUT TO RESTORE LATER)
            {!customerToken && !otpSent && (
              <form
                onSubmit={handleSendOtp}
                className="lp-checkout-form-step lp-fade-in">
                <h4>Customer Details</h4>
                <p className="checkout-step-desc">
                  Enter your name and phone number to verify and prepare order
                  delivery.
                </p>

                <div className="lp-form-group">
                  <label htmlFor="checkoutPhone">Mobile Number *</label>
                  <input
                    type="tel"
                    id="checkoutPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-Digit Mobile Number"
                    maxLength="10"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={otpVerifying}
                  className="lp-btn lp-btn-primary lp-btn-block form-action-btn">
                  {otpVerifying ? "Sending OTP..." : "Verify Mobile via OTP"}
                </button>

                <button
                  type="button"
                  onClick={onGoBackToCart}
                  className="lp-btn lp-btn-secondary lp-btn-block form-back-btn">
                  Go Back to Cart
                </button>
              </form>
            )}

            {!customerToken && otpSent && (
              <form
                onSubmit={handleVerifyOtp}
                className="lp-checkout-form-step lp-fade-in">
                <h4>Mobile OTP Verification</h4>
                <p className="checkout-step-desc">
                  An OTP has been sent to <strong>+91 {customerPhone}</strong>.
                  Check your console / terminal!
                </p>

                {!isRegistered && (
                  <div className="lp-form-group">
                    <label htmlFor="checkoutName">Full Name *</label>
                    <input
                      type="text"
                      id="checkoutName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                )}

                <div className="lp-form-group">
                  <label htmlFor="checkoutOtp">Enter 6-Digit OTP *</label>
                  <input
                    type="text"
                    id="checkoutOtp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-Digit OTP"
                    maxLength="6"
                    required
                  />
                  
                </div>

                <button
                  type="submit"
                  disabled={otpVerifying}
                  className="lp-btn lp-btn-primary lp-btn-block form-action-btn">
                  {otpVerifying ? "Verifying..." : "Confirm OTP & Log In"}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="lp-btn lp-btn-secondary lp-btn-block form-back-btn">
                  Go Back to Details
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="lp-btn-link-action">
                  Change Phone Number
                </button>
              </form>
            )}
            */}

            {/* Step 3 & 4: Delivery (Address & Delivery Details) */}
            {customerToken && (
              <form
                onSubmit={onSubmitCheckoutForm}
                className="lp-checkout-form-step lp-fade-in">
                {(!customerInfo?.customerName || customerInfo.customerName === "Anonymous") ? (
                  <div className="checkout-section">
                    <h4>Welcome!</h4>
                    <p className="checkout-step-desc">Please enter your name to complete registration.</p>
                    <div className="lp-form-group">
                      <label htmlFor="checkoutRealName">Full Name *</label>
                      <input
                        type="text"
                        id="checkoutRealName"
                        value={customerName === "Anonymous" ? "" : customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="checkout-section" style={{ borderBottom: "none", paddingBottom: "0" }}>
                    <h4 style={{ color: "#1e3a8a", margin: "0" }}>Hello, {customerInfo.customerName}!</h4>
                  </div>
                )}

                <div className="checkout-section">
                  <h4>Delivery Location Details</h4>

                  {addresses.length > 0 && (
                    <div className="saved-addresses-list">
                      <h5>Select Saved Address:</h5>
                      {addresses.map((addr, idx) => (
                        <label
                          key={idx}
                          className={`saved-address-card ${selectedAddressIndex === idx ? "selected" : ""}`}>
                          <input
                            type="radio"
                            name="selectedAddress"
                            checked={selectedAddressIndex === idx}
                            onChange={() => setSelectedAddressIndex(idx)}
                          />
                          <div className="address-details">
                            <strong>
                              {addr.houseNo ? `${addr.houseNo}, ` : ""}
                              {addr.street}
                            </strong>
                            <span>
                              {addr.landmark
                                ? `(Landmark: ${addr.landmark}), `
                                : ""}
                              {addr.city} - {addr.pincode}
                            </span>
                          </div>
                        </label>
                      ))}
                      <label
                        className={`saved-address-card ${selectedAddressIndex === -1 ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressIndex === -1}
                          onChange={() => setSelectedAddressIndex(-1)}
                        />
                        <div className="address-details">
                          <strong>Deliver to a New Address</strong>
                        </div>
                      </label>
                    </div>
                  )}

                  {selectedAddressIndex === -1 && (
                    <div className="new-address-form lp-fade-in">
                      <div className="lp-form-row">
                        <div className="lp-form-group">
                          <label>House/Flat No.</label>
                          <input
                            type="text"
                            value={newAddress.houseNo}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                houseNo: e.target.value,
                              })
                            }
                            placeholder="e.g. D No. 5-57/3"
                          />
                        </div>
                        <div className="lp-form-group">
                          <label>Street / Area *</label>
                          <input
                            type="text"
                            value={newAddress.street}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                street: e.target.value,
                              })
                            }
                            placeholder="e.g. Main Road, Patha Gannavaram"
                            required
                          />
                        </div>
                      </div>
                      <div className="lp-form-group">
                        <label>Landmark</label>
                        <input
                          type="text"
                          value={newAddress.landmark}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              landmark: e.target.value,
                            })
                          }
                          placeholder="e.g. Near Ramalayam Temple"
                        />
                      </div>
                      <div className="lp-form-row">
                        <div className="lp-form-group">
                          <label>City / Town *</label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                city: e.target.value,
                              })
                            }
                            placeholder="P.Gannavaram"
                            required
                          />
                        </div>
                        <div className="lp-form-group">
                          <label>Pincode *</label>
                          <input
                            type="text"
                            value={newAddress.pincode}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                pincode: e.target.value,
                              })
                            }
                            placeholder="533240"
                            maxLength="6"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="checkout-section">
                  <h4>Delivery Instructions</h4>
                  <div className="lp-form-group">
                    <textarea
                      rows="2"
                      placeholder="e.g. Please leave the milk packet at the gate box."
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="checkout-section">
                  <h4>Payment Mode</h4>
                  <div className="payment-options" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label
                      className={`payment-card ${selectedPaymentMethod === "COD" ? "selected" : ""}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px",
                        border: selectedPaymentMethod === "COD" ? "2px solid #059669" : "1px solid var(--color-border)",
                        borderRadius: "10px",
                        cursor: "pointer",
                        background: selectedPaymentMethod === "COD" ? "rgba(16, 185, 129, 0.05)" : "#fff",
                      }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={selectedPaymentMethod === "COD"}
                        onChange={() => setSelectedPaymentMethod("COD")}
                      />
                      <div className="payment-details">
                        <strong>Cash on Delivery (COD)</strong>
                        <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Pay with Cash or UPI upon order delivery.</span>
                      </div>
                    </label>

                    <label
                      className={`payment-card ${selectedPaymentMethod === "QR_PAYMENT" ? "selected" : ""}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px",
                        border: selectedPaymentMethod === "QR_PAYMENT" ? "2px solid #059669" : "1px solid var(--color-border)",
                        borderRadius: "10px",
                        cursor: "pointer",
                        background: selectedPaymentMethod === "QR_PAYMENT" ? "rgba(16, 185, 129, 0.05)" : "#fff",
                      }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="QR_PAYMENT"
                        checked={selectedPaymentMethod === "QR_PAYMENT"}
                        onChange={() => setSelectedPaymentMethod("QR_PAYMENT")}
                      />
                      <div className="payment-details">
                        <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          📱 Scan & Pay (UPI QR Code)
                          <span style={{ fontSize: "0.7rem", background: "#10b981", color: "#fff", padding: "2px 6px", borderRadius: "4px" }}>Fast Pay</span>
                        </strong>
                        <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Pay using PhonePe, Google Pay, Paytm & upload proof.</span>
                      </div>
                    </label>
                  </div>

                  {selectedPaymentMethod === "QR_PAYMENT" && (
                    <div
                      style={{
                        marginTop: "14px",
                        padding: "16px",
                        backgroundColor: "#f8fafc",
                        border: "1px dashed #cbd5e1",
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                      }}>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>
                          Scan QR Code using PhonePe / GPay / Paytm
                        </p>
                        <div style={{ background: "#ffffff", padding: "10px", borderRadius: "12px", display: "inline-block", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                          <img
                            src={qrScannerImg}
                            alt="SLG Milk Dairys Payment QR Code"
                            style={{ width: "210px", height: "210px", objectFit: "contain", borderRadius: "8px" }}
                          />
                        </div>
                        <p style={{ margin: "8px 0 0 0", fontSize: "0.95rem", fontWeight: 800, color: "#059669" }}>
                          Amount to Pay: ₹{cartTotal - discountAmount}
                        </p>
                      </div>

                      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
                        <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                          1. Upload Payment Screenshot (Recommended)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotChange}
                          style={{ fontSize: "0.8rem", width: "100%" }}
                        />
                        {screenshotPreview && (
                          <div style={{ marginTop: "10px", position: "relative", display: "inline-block" }}>
                            <img
                              src={screenshotPreview}
                              alt="Payment Screenshot Preview"
                              style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", border: "2px solid #10b981" }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentScreenshot(null);
                                setScreenshotPreview(null);
                              }}
                              style={{
                                position: "absolute",
                                top: "-6px",
                                right: "-6px",
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: "50%",
                                width: "20px",
                                height: "20px",
                                fontSize: "12px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}>
                              ×
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                          2. Transaction ID / UTR Number
                        </label>
                        <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="e.g. 12-digit UTR (e.g. 4235XXXXXXXX)"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        />
                      </div>

                      {uploadError && (
                        <p style={{ color: "#ef4444", fontSize: "0.8rem", margin: 0, fontWeight: 600 }}>
                          {uploadError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="checkout-section">
                  <h4>Promo Code / Coupon</h4>
                  {!appliedCoupon && (
                    <div
                      style={{
                        marginBottom: "12px",
                        padding: "8px 12px",
                        backgroundColor: "rgba(16, 185, 129, 0.08)",
                        border: "1px dashed rgba(16, 185, 129, 0.4)",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}>
                      <span style={{ fontSize: "0.82rem", color: "#065f46", fontWeight: 500 }}>
                        🎁 Use code <strong style={{ fontFamily: "monospace", fontSize: "0.92rem", color: "#047857" }}>SLG05</strong> for <strong>5% OFF</strong> (Unlimited Uses)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCouponCode("SLG05");
                        }}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #059669",
                          color: "#059669",
                          borderRadius: "4px",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          padding: "3px 8px",
                          whiteSpace: "nowrap",
                        }}>
                        Auto Fill
                      </button>
                    </div>
                  )}
                  {!appliedCoupon ? (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="ENTER COUPON CODE"
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          border: "1px solid var(--color-border)",
                          borderRadius: "6px",
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          fontWeight: 600,
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                        className="lp-btn lp-btn-primary"
                        style={{ padding: "0 16px", height: "auto", fontSize: "0.85rem", width: "auto" }}
                      >
                        {applyingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "6px", padding: "8px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <CheckCircle size={16} style={{ color: "var(--color-success)" }} />
                        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--color-success)", letterSpacing: "0.02em" }}>{appliedCoupon.code} Applied</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, padding: 0 }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p style={{ color: "var(--color-danger)", fontSize: "0.78rem", margin: "6px 0 0 0", fontWeight: 500 }}>
                      {couponError}
                    </p>
                  )}
                </div>

                <div className="checkout-bill-preview">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="summary-row" style={{ color: "var(--color-danger)" }}>
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Grand Total</span>
                    <span>₹{cartTotal - discountAmount}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="lp-btn lp-btn-primary lp-btn-block checkout-submit-btn">
                  {isSubmittingOrder
                    ? "Confirming Order..."
                    : selectedPaymentMethod === "QR_PAYMENT"
                    ? `Confirm QR Payment (₹${cartTotal - discountAmount})`
                    : `Confirm COD Order (₹${cartTotal - discountAmount})`}
                </button>

                <button
                  type="button"
                  onClick={onGoBackToCart}
                  className="lp-btn lp-btn-secondary lp-btn-block form-back-btn"
                  style={{ marginTop: "12px" }}>
                  Go Back to Cart
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutDrawer;
