const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    OrderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    accountantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
        },
      },
    ],
    address: {
      houseNo: String,
      street: String,
      landmark: String,
      city: String,
      pincode: String,

      latitude: Number,
      longitude: Number,

      isDefault: {
        type: Boolean,
        default: false,
      },
    },
    subtotal: {
      type: Number,
    },
    deliveryFee: {
      type: Number,
    },
    totalAmount: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "card", "online"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
    },
    orderStatus: {
      type: String,
      enum: [
        "Placed",
        "Accepted",
        "Assigned",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
    },
    deliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryBoy",
    },
    isTempDelivery: {
      type: Boolean,
      default: false,
    },
    tempDeliveryBoy: {
      name: { type: String, default: null },
      phone: { type: String, default: null },
    },
    placedAt: {
      type: Date,
      default: Date.now,
    },
    assignedAt: {
      type: Date,
    },
    acceptedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    canceledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
      default: null,
    },
    cancelledBy: {
      type: String,
      enum: ["customer", "deliveryBoy", "admin", null],
      default: null,
    },
    deliveryOtp: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    invoiceNumber: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
