const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Counter = require("../models/Counter");
const { sendNotification } = require("../utils/notificationHelper");

// @desc    Place a new customer order
// @route   POST /api/orders
// @access  Private (Customer)
exports.placeOrder = async (req, res) => {
  try {
    const { products, address, paymentMethod, notes } = req.body;
    const customerId = req.customer._id;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "No products in order" });
    }

    if (!address || !address.street || !address.city || !address.pincode) {
      return res.status(400).json({ message: "Incomplete address details. Street, City, and Pincode are required." });
    }

    // Calculate totals & verify stock
    let subtotal = 0;
    const orderProducts = [];

    for (const item of products) {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ message: "Invalid product item or quantity in order payload" });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      if (!product.isAvailable) {
        return res.status(400).json({ message: `Product '${product.name}' is currently unavailable.` });
      }

      if (product.stock !== undefined && product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product '${product.name}'. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      // Customer orders are retail prices
      const price = product.retailPrice !== undefined ? product.retailPrice : (product.price || 0);
      subtotal += price * item.quantity;

      orderProducts.push({
        product: product._id,
        quantity: item.quantity
      });
    }

    // Calculate delivery fee: free if subtotal >= 500, else 20
    const deliveryFee = subtotal >= 500 ? 0 : 20;
    const totalAmount = subtotal + deliveryFee;

    // Generate Order Number: ORD-YYYYMM-XXXX
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const yearMonthStr = `${year}${month.toString().padStart(2, "0")}`;
    
    const counter = await Counter.findOneAndUpdate(
      { name: `ORD-${yearMonthStr}` },
      { $inc: { sequence: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const sequence = counter.sequence.toString().padStart(4, "0");
    const orderNumber = `ORD-${yearMonthStr}-${sequence}`;

    // Create Order
    const order = new Order({
      OrderNumber: orderNumber,
      customerId,
      products: orderProducts,
      address: {
        houseNo: address.houseNo || "",
        street: address.street,
        landmark: address.landmark || "",
        city: address.city,
        pincode: address.pincode,
        latitude: address.latitude,
        longitude: address.longitude,
        isDefault: address.isDefault || false
      },
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: "pending",
      orderStatus: "Placed",
      notes: notes || null
    });

    await order.save();

    // Deduct stock for each product
    for (const item of products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Update Customer details
    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.totalOrders = (customer.totalOrders || 0) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + totalAmount;
      
      // Save address if not already in customer's address list
      const addressExists = customer.addresses && customer.addresses.some(
        (addr) =>
          addr.street === address.street &&
          addr.city === address.city &&
          addr.pincode === address.pincode
      );

      if (!addressExists) {
        if (!customer.addresses) customer.addresses = [];
        customer.addresses.push({
          houseNo: address.houseNo || "",
          street: address.street,
          landmark: address.landmark || "",
          city: address.city,
          pincode: address.pincode,
          latitude: address.latitude,
          longitude: address.longitude,
          isDefault: address.isDefault || false
        });
      }

      // Add to products history
      if (!customer.productsHistory) customer.productsHistory = [];
      customer.productsHistory.push(
        ...orderProducts.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          OrderNumber: orderNumber
        }))
      );

      await customer.save();
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("products.product", "name price retailPrice category image");

    // Send live notification to accountants/admins
    await sendNotification({
      recipientType: "accountant",
      title: "New Order Placed",
      message: `New order ${orderNumber} placed by ${customer?.customerName || "Customer"} for ₹${totalAmount}`,
      type: "success",
      referenceId: order._id,
      from: "customer"
    });

    res.status(201).json({
      message: "Order placed successfully",
      order: populatedOrder
    });
  } catch (error) {
    console.error("Place Order Error:", error);
    res.status(500).json({ message: "Server error placing order" });
  }
};

// @desc    Get customer's orders
// @route   GET /api/orders
// @access  Private (Customer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.customer._id })
      .populate("products.product", "name price retailPrice category image")
      .populate("deliveryBoy", "name phone")
      .sort({ placedAt: -1 });

    res.status(200).json({
      message: "Orders fetched successfully",
      orders
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);
    res.status(500).json({ message: "Server error fetching orders" });
  }
};

// @desc    Get order details by order number
// @route   GET /api/orders/:orderNumber
// @access  Private (Customer)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      OrderNumber: req.params.orderNumber,
      customerId: req.customer._id
    })
      .populate("products.product", "name price retailPrice category image")
      .populate("deliveryBoy", "name phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order details fetched successfully",
      order
    });
  } catch (error) {
    console.error("Get Order By Id Error:", error);
    res.status(500).json({ message: "Server error fetching order details" });
  }
};

// @desc    Cancel a placed order
// @route   PUT /api/orders/:orderNumber/cancel
// @access  Private (Customer)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      OrderNumber: req.params.orderNumber,
      customerId: req.customer._id
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus !== "Placed") {
      return res.status(400).json({
        message: `Order cannot be cancelled at this stage (current status: ${order.orderStatus})`
      });
    }

    order.orderStatus = "Cancelled";
    order.cancelledBy = "customer";
    order.canceledAt = new Date();
    if (req.body.reason) {
      order.cancelReason = req.body.reason;
    }

    await order.save();

    // Restore stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    // Restore customer spend details
    const customer = await Customer.findById(req.customer._id);
    if (customer) {
      customer.totalSpent = Math.max(0, (customer.totalSpent || 0) - order.totalAmount);
      await customer.save();
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("products.product", "name price retailPrice category image");

    // Send live notification to accountants/admins
    await sendNotification({
      recipientType: "accountant",
      title: "Order Cancelled",
      message: `Order ${order.OrderNumber} has been cancelled by the customer.`,
      type: "warning",
      referenceId: order._id,
      from: "customer"
    });

    res.status(200).json({
      message: "Order cancelled successfully",
      order: populatedOrder
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ message: "Server error cancelling order" });
  }
};

// @desc    Get order details publicly for standalone delivery boys
// @route   GET /api/orders/delivery-details/:orderNumber
// @access  Public
exports.getDeliveryDetailsPublic = async (req, res) => {
  try {
    const order = await Order.findOne({ OrderNumber: req.params.orderNumber })
      .populate("customerId", "customerName customerPhone")
      .populate("products.product", "name price retailPrice category image")
      .populate("deliveryBoy", "name phone")
      .populate("accountantId", "name email phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Delivery details fetched successfully",
      order
    });
  } catch (error) {
    console.error("Get Delivery Details Public Error:", error);
    res.status(500).json({ message: "Server error fetching delivery details" });
  }
};
