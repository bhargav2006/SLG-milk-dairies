const mongoose = require("mongoose");

const CustomerRecordSchema = new mongoose.Schema(
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
    optOut: {
      type: Boolean,
      default: false,
    },
    loyaltyPoints: {
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
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Define partial unique index for customerPhone so multiple null/undefined values can coexist.
CustomerRecordSchema.index(
  { customerPhone: 1 },
  { unique: true, partialFilterExpression: { customerPhone: { $type: "string" } } }
);

const CustomerRecord = mongoose.model("CustomerRecord", CustomerRecordSchema);

module.exports = CustomerRecord;
