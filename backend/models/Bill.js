const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerNumber: {
      type: String,
      default: null,
    },
    customerMail: {
      type: String,
      ref: "CustomerMail",
      default: null,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "online"],
      required: true,
    },
    accountant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    billType: {
      type: String,
      enum: ["retail", "wholesale"],
      default: "retail",
    },
  },
  {
    timestamps: true,
  },
);

const Bill = mongoose.model("Bill", BillSchema);

module.exports = Bill;
