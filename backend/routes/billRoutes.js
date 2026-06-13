const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");

const {
  createBill,
  getBills,
  getBillById,
  getBillByCustomerNumber,
  getBillByAccountantId,
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

module.exports = router;
