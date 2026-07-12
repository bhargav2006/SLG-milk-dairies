const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getPendingOrders,
  getAcceptedOrders,
  getAssignedOrders,
  acceptOrder,
  assignDeliveryBoy,
  getAllDeliveryBoys,
} = require("../controllers/accountantController");

// Pending Orders
router.get("/orders/pending", protect, getPendingOrders);

// Accepted Orders
router.get("/orders/accepted", protect, getAcceptedOrders);

// Assigned Orders
router.get("/orders/assigned", protect, getAssignedOrders);

// Accept
router.put("/orders/:orderNumber/accept", protect, acceptOrder);

// Assign
router.put("/orders/:orderNumber/assign", protect, assignDeliveryBoy);

// Delivery Boys
router.get("/delivery-boys", protect, getAllDeliveryBoys);

module.exports = router;
