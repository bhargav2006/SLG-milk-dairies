const express = require("express");

const router = express.Router();

const { customerProtect } = require("../middleware/customerMiddleware");

const {
  getProducts,
  getProductById,
} = require("../controllers/productController");

// Customer Product List
router.get("/", getProducts);

// Single Product
router.get("/:id", getProductById);

module.exports = router;
