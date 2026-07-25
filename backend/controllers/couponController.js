const Coupon = require("../models/Coupon");
const Order = require("../models/Order");

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private (Admin)
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      expiryDate,
      usageLimit,
      perCustomerLimit,
      isActive,
    } = req.body;

    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ message: "Code, discount type, and discount value are required" });
    }

    const uppercaseCode = code.toUpperCase().trim();

    // Check if coupon exists
    const existingCoupon = await Coupon.findOne({ code: uppercaseCode });
    if (existingCoupon) {
      return res.status(400).json({ message: `Coupon with code '${uppercaseCode}' already exists` });
    }

    const coupon = new Coupon({
      code: uppercaseCode,
      discountType,
      discountValue,
      minPurchase: minPurchase || 0,
      maxDiscount: maxDiscount || null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      usageLimit: usageLimit !== undefined ? usageLimit : null,
      perCustomerLimit: perCustomerLimit !== undefined ? perCustomerLimit : 1,
      isActive: isActive !== undefined ? isActive : true,
    });

    await coupon.save();

    res.status(201).json({
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Create Coupon Error:", error);
    res.status(500).json({ message: "Server error creating coupon" });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private (Admin/Accountant)
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ coupons });
  } catch (error) {
    console.error("Get Coupons Error:", error);
    res.status(500).json({ message: "Server error fetching coupons" });
  }
};

// @desc    Get a single coupon
// @route   GET /api/coupons/:id
// @access  Private (Admin/Accountant)
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.status(200).json({ coupon });
  } catch (error) {
    console.error("Get Coupon Error:", error);
    res.status(500).json({ message: "Server error fetching coupon details" });
  }
};

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private (Admin)
exports.updateCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      expiryDate,
      usageLimit,
      perCustomerLimit,
      isActive,
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (code) {
      const uppercaseCode = code.toUpperCase().trim();
      if (uppercaseCode !== coupon.code) {
        const existingCoupon = await Coupon.findOne({ code: uppercaseCode });
        if (existingCoupon) {
          return res.status(400).json({ message: `Coupon with code '${uppercaseCode}' already exists` });
        }
        coupon.code = uppercaseCode;
      }
    }

    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minPurchase !== undefined) coupon.minPurchase = minPurchase;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (expiryDate !== undefined) coupon.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (perCustomerLimit !== undefined) coupon.perCustomerLimit = perCustomerLimit;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.status(200).json({
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("Update Coupon Error:", error);
    res.status(500).json({ message: "Server error updating coupon" });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Delete Coupon Error:", error);
    res.status(500).json({ message: "Server error deleting coupon" });
  }
};

// @desc    Validate coupon code for customer
// @route   POST /api/coupons/validate
// @access  Private (Customer)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || subtotal === undefined) {
      return res.status(400).json({ message: "Coupon code and subtotal are required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon code not found" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "This coupon is no longer active" });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: "This coupon has expired" });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "This coupon's total usage limit has been reached" });
    }

    if (coupon.perCustomerLimit !== null && req.customer) {
      const customerUsageCount = await Order.countDocuments({
        customerId: req.customer._id,
        couponCode: coupon.code,
        orderStatus: { $ne: "Cancelled" },
      });

      if (customerUsageCount >= coupon.perCustomerLimit) {
        return res.status(400).json({
          message: `You have reached the maximum usage limit of ${coupon.perCustomerLimit} time(s) for this coupon`,
        });
      }
    }

    if (subtotal < coupon.minPurchase) {
      return res.status(400).json({
        message: `Minimum purchase of ₹${coupon.minPurchase} is required to apply this coupon`,
      });
    }

    // Calculate discount amount
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    }

    if (discount > subtotal) {
      discount = subtotal;
    }

    res.status(200).json({
      message: "Coupon code applied successfully",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
      },
    });
  } catch (error) {
    console.error("Validate Coupon Error:", error);
    res.status(500).json({ message: "Server error validating coupon code" });
  }
};
