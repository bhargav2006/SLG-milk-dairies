const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { customerProtect } = require("../middleware/customerMiddleware");
const {
  getStaffNotifications,
  getCustomerNotifications,
  markStaffNotificationAsRead,
  markCustomerNotificationAsRead,
  markAllStaffNotificationsAsRead,
  markAllCustomerNotificationsAsRead,
} = require("../controllers/notificationController");

// Staff routes (requires protect middleware)
router.get("/staff", protect, getStaffNotifications);
router.put("/staff/read-all", protect, markAllStaffNotificationsAsRead);
router.put("/staff/:id/read", protect, markStaffNotificationAsRead);

// Customer routes (requires customerProtect middleware)
router.get("/customer", customerProtect, getCustomerNotifications);
router.put("/customer/read-all", customerProtect, markAllCustomerNotificationsAsRead);
router.put("/customer/:id/read", customerProtect, markCustomerNotificationAsRead);

module.exports = router;
