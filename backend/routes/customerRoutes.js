const express = require("express");
const router = express.Router();

const { customerProtect } = require("../middleware/customerMiddleware");

const {
  sendOtp,
  verifyOtp,
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/CustomerController");

// OTP
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Customer Profile
router.get("/profile", customerProtect, getProfile);
// router.put("/profile", customerProtect, updateProfile);

// Addresses
// router.post("/address", customerProtect, addAddress);
// router.put("/address/:addressId", customerProtect, updateAddress);
// router.delete("/address/:addressId", customerProtect, deleteAddress);

module.exports = router;
