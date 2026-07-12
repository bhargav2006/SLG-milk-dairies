const express = require("express");
const router = express.Router();

const { deliveryProtect } = require("../middleware/deliveryMiddleware");
const { protect, admin } = require("../middleware/authMiddleware");

const {
  registerDeliveryBoy,
  loginDeliveryBoy,
  getAssignedOrders,
  getOrderDetails,
  updateOrderStatus,
  updateAvailability,
  sendDeliveryOtp,
  getDeliveryBoys,
  updateDeliveryBoy,
  deleteDeliveryBoy,
} = require("../controllers/deliveryController");

// Admin register Delivery Boy
router.post("/register", protect, admin, registerDeliveryBoy);

// Admin manage Delivery Boys
router.get("/", protect, admin, getDeliveryBoys);
router.put("/:id", protect, admin, updateDeliveryBoy);
router.delete("/:id", protect, admin, deleteDeliveryBoy);

// Login
router.post("/login", loginDeliveryBoy);

// Assigned Orders
router.get("/orders", deliveryProtect, getAssignedOrders);

// Single Order
router.get("/orders/:orderNumber", deliveryProtect, getOrderDetails);

// Send OTP
router.post("/orders/:orderNumber/send-otp", deliveryProtect, sendDeliveryOtp);

// Update Status
router.put("/orders/:orderNumber/status", deliveryProtect, updateOrderStatus);

// Availability
router.put("/availability", deliveryProtect, updateAvailability);

module.exports = router;
