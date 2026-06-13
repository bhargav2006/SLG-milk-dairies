const Product = require("../models/Product");

// @desc    Get all products
// @route   GET /api/products/
const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy,
      order = "asc",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // Search by name
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Sorting
    let sort = {};

    switch (sortBy) {
      case "price":
        sort.price = order === "desc" ? -1 : 1;
        break;

      case "name":
        sort.name = order === "desc" ? -1 : 1;
        break;

      case "serialNumber":
        sort.serialNumber = order === "desc" ? -1 : 1;
        break;

      case "newest":
        sort.createdAt = -1;
        break;

      case "oldest":
        sort.createdAt = 1;
        break;

      default:
        sort.createdAt = -1;
    }

    // Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limitNum),

      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new product
// @route   POST /api/products/
const createProduct = async (req, res) => {
  try {
    const { name, serialNumber, price, description, category } = req.body;
    if (!name || !serialNumber || price === undefined || !category) {
      return res
        .status(400)
        .json({ message: "Name, serial number, category, and price are required" });
    }
    const existingProduct = await Product.findOne({ serialNumber });
    if (existingProduct) {
      return res
        .status(400)
        .json({ message: "Product with this serial number already exists" });
    }
    const product = new Product({ name, serialNumber, price, description: description || "", category });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { name, serialNumber, price, description, category } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (price !== undefined) product.price = price;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (name) product.name = name;
    if (serialNumber) {
      const existingProduct = await Product.findOne({
        serialNumber,
        _id: { $ne: req.params.id },
      });
      if (existingProduct) {
        return res.status(400).json({
          message: "Another product with this serial number already exists",
        });
      }
      product.serialNumber = serialNumber;
    }
    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await product.deleteOne();
    res.json({ message: `${product.name} deleted` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
