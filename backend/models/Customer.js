const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      default: "Anonymous",
    },
    customerPhone: {
      type: String,
      default: null,
    },
    customerEmail: {
      type: String,
      default: null,
    },
    addresses: [
      {
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
    ],
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    optOut: {
      type: Boolean,
      default: false,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    msgSent: {
      type: Number,
      default: 0,
    },
    productsHistory: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
        },
        invoiceNumber: {
          type: String,
        },
        OrderNumber: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Define partial unique index for customerPhone so multiple null/undefined values can coexist.
CustomerSchema.index(
  { customerPhone: 1 },
  {
    unique: true,
    partialFilterExpression: { customerPhone: { $type: "string" } },
  },
);

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
