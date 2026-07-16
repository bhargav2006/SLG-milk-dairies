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
} from "lucide-react";

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
}) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  // Determine current active step index:
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
              console.log(
                "[Checkout Debug] checkout back button clicked -> onGoBackToCart",
              );
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
              console.log(
                "[Checkout Debug] checkout close button clicked -> onClose",
              );
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
              {st.index < 5 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>

        {/* Checkout Steps Render */}
        {activeStep === 5 && placedOrder ? (
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
            {/* Step 1: Details (Name & Phone inputs) */}
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

            {/* Step 2: Verification (OTP verification input) */}
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
                  {/* [TESTING ONLY] Temporary OTP placeholder printed directly under the field */}
                  {tempOtp && (
                    <div style={{ marginTop: "6px", fontSize: "0.82rem", color: "#d97706", fontWeight: "bold" }}>
                      [TESTING ONLY] Temporary OTP: {tempOtp}
                    </div>
                  )}
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

            {/* Step 3 & 4: Delivery (Address & Delivery Details) */}
            {customerToken && (
              <form
                onSubmit={handlePlaceOrder}
                className="lp-checkout-form-step lp-fade-in">
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
                  <div className="payment-options">
                    <label className="payment-card selected">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked
                        readOnly
                      />
                      <div className="payment-details">
                        <strong>Cash on Delivery (COD)</strong>
                        <span>UPI or Cash accepted at delivery.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="checkout-bill-preview">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Grand Total</span>
                    <span>₹{cartTotal}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="lp-btn lp-btn-primary lp-btn-block checkout-submit-btn">
                  {isSubmittingOrder
                    ? "Confirming Order..."
                    : `Confirm COD Order (₹${cartTotal})`}
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
