const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  recipientType: {
    type: String,
    enum: ["customer", "deliveryBoy", "admin", "accountant"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["info", "warning", "error", "success"],
    default: "info",
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "referenceModel",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  from: {
    type: String,
    enum: ["customer", "deliveryBoy", "admin", "accountant"],
    required: true,
  },
  at: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
