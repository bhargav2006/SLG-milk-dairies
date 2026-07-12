const dotenv = require("dotenv");
dotenv.config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const billRoutes = require("./routes/billRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const customerProductRoutes = require("./routes/customerProductRoutes");
const accountantRoutes = require("./routes/accountantRoutes");

const app = express();
const server = require("http").createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost",
  "http://20.2.139.220",
  "https://slgmilkdairys.de",
  "https://www.slgmilkdairys.de",
  "https://staging.slgmilkdairys.de",
  process.env.CORS_ORIGIN,
];

// Middleware
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/bill", billRoutes);

app.use("/api/customer", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/accountant", accountantRoutes);
// // Public customer products
app.use("/api/shop/products", customerProductRoutes);

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// webhook routes
app.use(bodyParser.json());
app.use("/api/webhook", webhookRoutes);

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

if (!fs.existsSync("uploads/products")) {
  fs.mkdirSync("uploads/products", { recursive: true });
}

if (!fs.existsSync("uploads/defaults")) {
  fs.mkdirSync("uploads/defaults", { recursive: true });
}

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

// Error handling middleware (catches Multer, upload, validation, and other errors as JSON)
app.use((err, req, res, next) => {
  console.error("Error Handler:", err);
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "An unexpected error occurred";

  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File is too large. Maximum size allowed is 10MB.";
  } else if (err.name === "MulterError") {
    statusCode = 400;
    message = `Upload error: ${err.message}`;
  }

  res.status(statusCode).json({ message });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

startServer();
