const express = require("express");
const router = express.Router();

const { customerProtect } = require("../middleware/customerMiddleware");

const {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getDeliveryDetailsPublic,
} = require("../controllers/orderController");

// Place Order
router.post("/", customerProtect, placeOrder);

// My Orders
router.get("/", customerProtect, getMyOrders);

// Standalone public details for delivery
router.get("/delivery-details/:orderNumber", getDeliveryDetailsPublic);

// Single Order
router.get("/:orderNumber", customerProtect, getOrderById);

// Cancel
router.put("/:orderNumber/cancel", customerProtect, cancelOrder);

module.exports = router;
