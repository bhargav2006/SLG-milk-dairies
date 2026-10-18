// Fast, paginated bill queries for the Bills page.
// Replaces "download every bill, filter in the browser" with "ask the database for exactly what is shown".
const mongoose = require("mongoose");
const Bill = require("../models/Bill");
const Branch = require("../models/Branch");
const User = require("../models/User");

const ObjectId = mongoose.Types.ObjectId;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // Asia/Kolkata, no daylight saving

// "2026-10-18" -> { start, end } in UTC for that IST calendar day
const istDayRange = (ymd) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || "");
  if (!m) return null;
  const start = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]) - IST_OFFSET_MS);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
};
const todayYMD = () => new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);

// Payment filter groups (same grouping the frontend used to do)
const PAYMENT_GROUPS = {
  cash: ["cash", "COD", "cod"],
  card: ["card", "credit_card", "debit_card"],
  online: ["online", "qr_payment", "upi", "UPI", "upidelivery"],
};
const normalizePayment = (m) => {
  const v = String(m || "cash").trim().toLowerCase();
  if (v === "cash" || v === "cod") return "cash";
  if (v === "card" || v === "credit_card" || v === "debit_card") return "card";
  if (v === "online" || v === "qr_payment" || v === "upi" || v === "upidelivery") return "online";
  return v;
};

// Main branch id changes almost never: remember it for 5 minutes instead of querying every request
let mainBranchCache = { id: null, at: 0 };
const getMainBranchId = async () => {
  if (Date.now() - mainBranchCache.at < 5 * 60 * 1000) return mainBranchCache.id;
  const b = await Branch.findOne({ isMain: true }).select("_id").lean();
  mainBranchCache = { id: b ? b._id : null, at: Date.now() };
  return mainBranchCache.id;
};

// Same access rules as the old getBills: accountants only see their own bills,
// admins see everything or one branch.
const baseFilter = async (req) => {
  const { billType, branchId } = req.query;
  const filter = {};
  if (["retail", "wholesale", "delivery"].includes(billType)) filter.billType = billType;

  const role = req.user && req.user.role;
  if (role === "accountant" || role === "branch_admin") {
    filter.accountant = new ObjectId(req.user._id);
  } else if (role === "admin" && branchId && branchId !== "all" && mongoose.isValidObjectId(branchId)) {
    const target = new ObjectId(branchId);
    const mainId = await getMainBranchId();
    if (mainId && mainId.toString() === String(branchId)) {
      filter.$or = [{ branch: target }, { branch: { $exists: false } }, { branch: null }];
    } else {
      filter.branch = target;
    }
  }
  return filter;
};

// GET /api/bill/list?page=1&limit=10&date=YYYY-MM-DD&billType=&paymentMethod=&accountant=&search=&branchId=
exports.listBills = async (req, res) => {
  try {
    const filter = await baseFilter(req);
    const { paymentMethod, accountant, search, date } = req.query;

    if (paymentMethod && PAYMENT_GROUPS[String(paymentMethod).toLowerCase()]) {
      filter.paymentMethod = { $in: PAYMENT_GROUPS[String(paymentMethod).toLowerCase()] };
    }
    if (accountant && req.user.role === "admin" && mongoose.isValidObjectId(accountant)) {
      filter.accountant = new ObjectId(accountant);
    }
    const digits = String(search || "").replace(/\D/g, "");
    if (digits) filter.customerNumber = { $regex: digits };
    const range = istDayRange(date);
    if (range) filter.createdAt = { $gte: range.start, $lt: range.end };

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const [bills, total] = await Promise.all([
      Bill.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("invoiceNumber billType customerNumber totalAmount paymentMethod accountant createdAt")
        .populate("accountant", "name")
        .lean(),
      Bill.countDocuments(filter),
    ]);

    res.json({ bills, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    console.error("listBills error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/bill/summary?date=YYYY-MM-DD&billType=&branchId=
// Totals for one IST day + per-accountant sales, computed by the database.
exports.getBillSummary = async (req, res) => {
  try {
    const base = await baseFilter(req);
    const day = istDayRange(req.query.date) || istDayRange(todayYMD());
    const isAdmin = req.user && req.user.role === "admin";
    const inDay = { $and: [{ $gte: ["$createdAt", day.start] }, { $lt: ["$createdAt", day.end] }] };

    const [payRows, accRows] = await Promise.all([
      Bill.aggregate([
        { $match: { ...base, createdAt: { $gte: day.start, $lt: day.end } } },
        { $group: { _id: { $toLower: "$paymentMethod" }, amount: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]),
      isAdmin
        ? Bill.aggregate([
            { $match: base },
            {
              $group: {
                _id: "$accountant",
                totalSales: { $sum: "$totalAmount" },
                todaySales: { $sum: { $cond: [inDay, "$totalAmount", 0] } },
              },
            },
            { $lookup: { from: User.collection.name, localField: "_id", foreignField: "_id", as: "u" } },
            { $project: { totalSales: 1, todaySales: 1, name: { $arrayElemAt: ["$u.name", 0] } } },
          ])
        : Promise.resolve([]),
    ]);

    const stats = {
      totalSales: 0, totalBills: 0,
      cashAmount: 0, cashCount: 0,
      cardAmount: 0, cardCount: 0,
      onlineAmount: 0, onlineCount: 0,
    };
    for (const r of payRows) {
      stats.totalSales += r.amount;
      stats.totalBills += r.count;
      const mode = normalizePayment(r._id);
      if (mode === "cash") { stats.cashAmount += r.amount; stats.cashCount += r.count; }
      else if (mode === "card") { stats.cardAmount += r.amount; stats.cardCount += r.count; }
      else if (mode === "online") { stats.onlineAmount += r.amount; stats.onlineCount += r.count; }
    }

    const accountants = accRows
      .filter((a) => a._id)
      .map((a) => ({ id: a._id, name: a.name || "Deleted User", todaySales: a.todaySales, totalSales: a.totalSales }));

    res.json({ stats, accountants });
  } catch (error) {
    console.error("getBillSummary error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
