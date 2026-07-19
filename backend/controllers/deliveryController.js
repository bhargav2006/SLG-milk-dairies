const DeliveryBoy = require("../models/DeliveryBoy");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const generateToken = require("../utils/generateToken");
const { createInvoiceFromOrder } = require("../utils/invoiceHelper");

// @desc    Register a new delivery boy
// @route   POST /api/delivery/register
// @access  Private (Admin)
exports.registerDeliveryBoy = async (req, res) => {
  try {
    const { name, phone, password, currentLocation } = req.body;
    if (
      !name ||
      !phone ||
      !password ||
      !currentLocation ||
      !currentLocation.street ||
      !currentLocation.city
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingDeliveryBoy = await DeliveryBoy.findOne({ phone });
    if (existingDeliveryBoy) {
      return res.status(400).json({ message: "Delivery boy already exists" });
    }
    const newDeliveryBoy = await DeliveryBoy.create({
      name,
      phone,
      password,
      currentLocation,
    });
    res.status(201).json({
      message: "Delivery boy registered successfully",
      deliveryBoy: newDeliveryBoy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Login delivery boy
// @route   POST /api/delivery/login
// @access  Public
exports.loginDeliveryBoy = async (req, res) => {
  try {
    const { phone, password } = req.body;
    // console.log("Login request received:", { phone, password });
    if (!phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingDeliveryBoy = await DeliveryBoy.findOne({ phone });
    if (!existingDeliveryBoy) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await existingDeliveryBoy.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const payload = {
      id: existingDeliveryBoy._id,
      name: existingDeliveryBoy.name,
      role: "deliveryBoy",
    };
    const token = generateToken(payload);
    res.status(200).json({
      token,
      message: "Login successful",
      deliveryBoy: existingDeliveryBoy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get assigned orders for logged-in delivery boy
// @route   GET /api/delivery/orders
// @access  Private (Delivery Boy)
exports.getAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryBoy: req.deliveryBoy._id })
      .populate("customerId", "customerName customerPhone")
      .populate("products.product", "name price retailPrice category")
      .sort({ updatedAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching assigned orders" });
  }
};

// @desc    Get single order details by order number
// @route   GET /api/delivery/orders/:orderNumber
// @access  Private (Delivery Boy)
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({
      OrderNumber: req.params.orderNumber,
      deliveryBoy: req.deliveryBoy._id
    })
      .populate("customerId", "customerName customerPhone")
      .populate("products.product", "name price retailPrice category");

    if (!order) {
      return res.status(404).json({ message: "Order not found or not assigned to you" });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching order details" });
  }
};

// @desc    Update order status (Assigned -> Out for Delivery -> Delivered/Cancelled)
// @route   PUT /api/delivery/orders/:orderNumber/status
// @access  Private (Delivery Boy)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const validStatuses = ["Assigned", "Out for Delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status value" });
    }

    const order = await Order.findOne({
      OrderNumber: req.params.orderNumber,
      deliveryBoy: req.deliveryBoy._id
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found or not assigned to you" });
    }

    if (["Delivered", "Cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({ message: `Order is already finalized as: ${order.orderStatus}` });
    }

    order.orderStatus = status;

    if (status === "Delivered") {
      const { otp } = req.body;
      if (!otp) {
        return res.status(400).json({ message: "OTP is required for delivery completion" });
      }
      if (order.deliveryOtp !== otp) {
        return res.status(400).json({ message: "Invalid Delivery OTP. Please verify with the customer." });
      }
      order.deliveryOtp = null; // Clear OTP
      order.paymentStatus = "completed";
      order.deliveredAt = new Date();
    } else if (status === "Cancelled") {
      order.cancelledBy = "deliveryBoy";
      order.canceledAt = new Date();
      order.cancelReason = cancelReason || "Customer refused or delivery issue";

      // Restore stock for all products
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }

      // Restore customer spend details
      const customer = await Customer.findById(order.customerId);
      if (customer) {
        customer.totalSpent = Math.max(0, (customer.totalSpent || 0) - order.totalAmount);
        await customer.save();
      }
    }

    await order.save();

    if (status === "Delivered") {
      await createInvoiceFromOrder(order);
    }

    res.status(200).json({ message: `Order status updated to ${status}`, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating order status" });
  }
};

// @desc    Update availability of delivery boy
// @route   PUT /api/delivery/availability
// @access  Private (Delivery Boy)
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({ message: "isAvailable must be boolean" });
    }

    req.deliveryBoy.isAvailable = isAvailable;
    await req.deliveryBoy.save();

    res.status(200).json({ message: "Availability updated successfully", isAvailable });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating availability" });
  }
};

// @desc    Send delivery completion OTP
// @route   POST /api/delivery/orders/:orderNumber/send-otp
// @access  Private (Delivery Boy)
exports.sendDeliveryOtp = async (req, res) => {
  try {
    const order = await Order.findOne({
      OrderNumber: req.params.orderNumber,
      deliveryBoy: req.deliveryBoy._id
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found or not assigned to you" });
    }

    if (["Delivered", "Cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({ message: `Order is already finalized as: ${order.orderStatus}` });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    order.deliveryOtp = otp;
    await order.save();

    // console.log("\n==================================================");
    // console.log(`[SMS MOCK] Delivery OTP for Order ${order.OrderNumber}: ${otp}`);
    // console.log("==================================================\n");

    res.status(200).json({ message: "Delivery confirmation OTP sent to customer. Check console logs." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error sending delivery OTP" });
  }
};

// @desc    Get all delivery boys
// @route   GET /api/delivery
// @access  Private (Admin)
exports.getDeliveryBoys = async (req, res) => {
  try {
    const boys = await DeliveryBoy.find({}).select("-password");
    res.status(200).json(boys);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error retrieving delivery boys" });
  }
};

// @desc    Update delivery boy
// @route   PUT /api/delivery/:id
// @access  Private (Admin)
exports.updateDeliveryBoy = async (req, res) => {
  try {
    const { name, phone, password, currentLocation, isAvailable, isActive } = req.body;
    const boy = await DeliveryBoy.findById(req.params.id);

    if (!boy) {
      return res.status(404).json({ message: "Delivery boy not found" });
    }

    // Check if phone number is unique if modified
    if (phone && phone !== boy.phone) {
      const existing = await DeliveryBoy.findOne({ phone });
      if (existing) {
        return res.status(400).json({ message: "Mobile number is already registered by another delivery partner" });
      }
      boy.phone = phone;
    }

    if (name) boy.name = name;
    if (currentLocation) {
      if (currentLocation.street) boy.currentLocation.street = currentLocation.street;
      if (currentLocation.city) boy.currentLocation.city = currentLocation.city;
    }
    if (typeof isAvailable === "boolean") boy.isAvailable = isAvailable;
    if (typeof isActive === "boolean") boy.isActive = isActive;
    
    if (password) {
      boy.password = password; // pre-save hook will hash it automatically
    }

    await boy.save();
    res.status(200).json({ message: "Delivery boy updated successfully", deliveryBoy: boy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating delivery boy" });
  }
};

// @desc    Delete delivery boy
// @route   DELETE /api/delivery/:id
// @access  Private (Admin)
exports.deleteDeliveryBoy = async (req, res) => {
  try {
    const boy = await DeliveryBoy.findByIdAndDelete(req.params.id);
    if (!boy) {
      return res.status(404).json({ message: "Delivery boy not found" });
    }
    res.status(200).json({ message: "Delivery boy deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting delivery boy" });
  }
};
