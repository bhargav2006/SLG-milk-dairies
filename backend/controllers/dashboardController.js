const mongoose = require("mongoose");
const Bill = require("../models/Bill");
const Branch = require("../models/Branch");

// Store timezone is Asia/Kolkata (UTC+5:30, no daylight saving).
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Returns [startUtc, endUtc) for "today" in IST.
function todayRangeIST(now = new Date()) {
  const istNow = new Date(now.getTime() + IST_OFFSET_MS);
  const startUtc = new Date(
    Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate()) - IST_OFFSET_MS,
  );
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);
  return { startUtc, endUtc };
}

const normalizePayment = (m) => {
  const v = String(m || "cash").trim().toLowerCase();
  if (v === "cash" || v === "cod") return "cash";
  if (v === "card" || v === "credit_card" || v === "debit_card") return "card";
  if (v === "online" || v === "qr_payment" || v === "upi" || v === "upidelivery") return "online";
  return v;
};

// GET /api/bill/dashboard/today?branchId=...
exports.getTodayDashboard = async (req, res) => {
  try {
    const { startUtc, endUtc } = todayRangeIST();
    const match = { createdAt: { $gte: startUtc, $lt: endUtc } };

    if (req.user && (req.user.role === "accountant" || req.user.role === "branch_admin")) {
      // same rule as getBills: only their own bills
      match.accountant = new mongoose.Types.ObjectId(req.user._id);
    } else if (req.user && req.user.role === "admin") {
      const branchId = req.query.branchId;
      if (branchId && branchId !== "all") {
        const mainBranch = await Branch.findOne({ isMain: true }).select("_id").lean();
        const target = new mongoose.Types.ObjectId(branchId);
        if (mainBranch && mainBranch._id.toString() === branchId.toString()) {
          match.$or = [{ branch: target }, { branch: { $exists: false } }, { branch: null }];
        } else {
          match.branch = target;
        }
      }
    }

    // Today's bills for the table: lightweight, NO product population.
    const bills = await Bill.find(match)
      .sort({ createdAt: -1 })
      .select("invoiceNumber billType customerNumber totalAmount paymentMethod accountant createdAt")
      .populate("accountant", "name")
      .lean();

    // Totals are computed from the same (small) list - one pass, no extra queries.
    const stats = {
      bills: bills.length,
      sales: 0, retailSales: 0, wholesaleSales: 0,
      cashAmount: 0, cashCount: 0,
      cardAmount: 0, cardCount: 0,
      onlineAmount: 0, onlineCount: 0,
    };
    for (const b of bills) {
      const amt = b.totalAmount || 0;
      stats.sales += amt;
      if (b.billType === "wholesale") stats.wholesaleSales += amt;
      else stats.retailSales += amt;

      const mode = normalizePayment(b.paymentMethod);
      if (mode === "cash") { stats.cashAmount += amt; stats.cashCount++; }
      else if (mode === "card") { stats.cardAmount += amt; stats.cardCount++; }
      else if (mode === "online") { stats.onlineAmount += amt; stats.onlineCount++; }
    }

    res.json({ stats, bills });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.todayRangeIST = todayRangeIST;
