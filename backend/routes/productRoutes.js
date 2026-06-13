const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController.js");

// Create a new product (admin only)
router.post("/", protect, admin, createProduct);

// Get all products (admin and accountant)
router.get("/", protect, getProducts);

// Get a single product by ID (admin and accountant)
router.get("/:id", protect, getProductById);

// Update a product (admin only)
router.put("/:id", protect, admin, updateProduct);

// Delete a product (admin only)
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
