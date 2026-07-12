const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 5 * 60 * 1000, // Expires in 5 minutes
  },
});

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model("Otp", OtpSchema);
module.exports = Otp;
