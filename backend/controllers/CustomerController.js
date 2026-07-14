const Customer = require("../models/Customer");
const Otp = require("../models/Otp");
const crypto = require("crypto");
const generateToken = require("../utils/generateToken");
const sendWhatsapp = require("../utils/sendWhatsapp");

exports.sendOtp = async (req, res) => {
  try {
    let { customerPhone } = req.body;

    if (!customerPhone) {
      return res.status(400).json({
        message: "Customer phone number is required",
      });
    }

    if (customerPhone.length !== 10 || !/^\d+$/.test(customerPhone)) {
      return res.status(400).json({
        message: "Invalid phone number format (should be 10 digits)",
      });
    }

    // Format phone number
    customerPhone = customerPhone.startsWith("91")
      ? customerPhone
      : `91${customerPhone}`;

    // Generate 6 digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Delete previous OTP if exists
    await Otp.deleteMany({
      phone: customerPhone,
    });

    // Save new OTP
    await Otp.create({
      phone: customerPhone,
      otp,
    });

    // Send OTP through WhatsApp
    // We'll create this utility next
    // await sendWhatsapp(customerPhone, otp);
    console.log(`OTP for ${customerPhone}: ${otp}`);

    // [TESTING ONLY] Send OTP in response for development / testing convenience
    res.status(200).json({
      message: "OTP sent successfully",
      otp, // [TESTING ONLY] Return generated OTP value
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    let { customerPhone, customerName, otp } = req.body;

    if (!customerPhone || !otp) {
      return res.status(400).json({
        message: "Phone number and OTP are required",
      });
    }

    customerPhone = customerPhone.startsWith("91")
      ? customerPhone
      : `91${customerPhone}`;

    const otpRecord = await Otp.findOne({
      phone: customerPhone,
      otp,
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await otpRecord.deleteOne();

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    // -----------------------------
    // Find Existing Customer
    // -----------------------------
    let customer = await Customer.findOne({
      customerPhone,
    });

    if (!customer) {
      // First Login
      customer = await Customer.create({
        customerPhone,
        customerName:
          customerName && customerName.trim()
            ? customerName.trim()
            : "Anonymous",
      });
    } else {
      // Update name only if customer still has default name
      if (
        customerName &&
        customerName.trim() &&
        (!customer.customerName || customer.customerName === "Anonymous")
      ) {
        customer.customerName = customerName.trim();
        await customer.save();
      }
    }

    await otpRecord.deleteOne();

    const token = generateToken({
      id: customer._id,
      role: "customer",
    });

    return res.status(200).json({
      message: "OTP verified successfully",
      token,
      customer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "OTP verification failed",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json({
      message: "Profile fetched successfully",
      customer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};
