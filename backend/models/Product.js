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
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  },
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
