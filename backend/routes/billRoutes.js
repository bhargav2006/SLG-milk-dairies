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
const { getTodayDashboard } = require("../controllers/dashboardController");
const { listBills, getBillSummary } = require("../controllers/billQueryController");

// Create a new bill (admin and accountant)
router.post("/", protect, createBill);

// Get ALL bills (old endpoint - heavy; the pages no longer use it)
router.get("/", protect, getBills);

// --- New fast endpoints. Single-segment paths like /list and /summary MUST stay
// --- above "/:invoiceNumber", otherwise Express treats "list" as an invoice number.
router.get("/dashboard/today", protect, getTodayDashboard);
router.get("/list", protect, listBills);
router.get("/summary", protect, getBillSummary);

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
