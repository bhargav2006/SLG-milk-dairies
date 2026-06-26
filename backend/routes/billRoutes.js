const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");

const {
  createBill,
  getBills,
  getBillById,
  getBillByCustomerNumber,
  getBillByAccountantId,
  updateBill,
  deleteBill,
} = require("../controllers/billController");

// Create a new bill (admin and accountant)
router.post("/", protect, createBill);

// Get all bills (admin)
router.get("/", protect, admin, getBills);

// Get bills by customer Number (admin and accountant )
router.get("/customer/:customerNumber", protect, getBillByCustomerNumber);

// Get bills by Accountant ID (admin and accountant )
router.get("/accountant/:accountantId", protect, getBillByAccountantId);

// Get a single bill by ID (admin and accountant)
router.get("/:invoiceNumber", getBillById);

// Update a bill (admin only)
router.put("/:invoiceNumber", protect, admin, updateBill);

// Delete a bill (admin only)
router.delete("/:invoiceNumber", protect, admin, deleteBill);

module.exports = router;
