const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    productType: {
      type: String,
      enum: ["retail", "wholesale"],
      default: "retail",
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  },
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
