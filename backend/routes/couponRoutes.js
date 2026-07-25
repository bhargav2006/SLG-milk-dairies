const express = require("express");
const router = express.Router();

const { protect, admin } = require("../middleware/authMiddleware");
const { customerProtect } = require("../middleware/customerMiddleware");

const {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require("../controllers/couponController");

// Validation route for customers (authenticated)
router.post("/validate", customerProtect, validateCoupon);

// CRUD routes for admin/staff
router.route("/")
  .post(protect, admin, createCoupon)
  .get(protect, getCoupons); // Let accountants view coupons too

router.route("/:id")
  .get(protect, getCouponById)
  .put(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

module.exports = router;
