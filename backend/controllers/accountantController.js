const Order = require("../models/Order");
const DeliveryBoy = require("../models/DeliveryBoy");

// @desc    Get pending orders (status: Placed)
// @route   GET /api/accountant/orders/pending
// @access  Private (Accountant/Admin)
exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: "Placed" })
      .populate("customerId", "customerName customerPhone")
      .populate("products.product", "name price retailPrice category")
      .sort({ placedAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching pending orders" });
  }
};

// @desc    Get accepted orders (status: Accepted)
// @route   GET /api/accountant/orders/accepted
// @access  Private (Accountant/Admin)
exports.getAcceptedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: "Accepted" })
      .populate("customerId", "customerName customerPhone")
      .populate("products.product", "name price retailPrice category")
      .sort({ placedAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching accepted orders" });
  }
};

// @desc    Get assigned/delivered/cancelled orders (status: Assigned, Out for Delivery, Delivered, Cancelled)
// @route   GET /api/accountant/orders/assigned
// @access  Private (Accountant/Admin)
exports.getAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: { $in: ["Assigned", "Out for Delivery", "Delivered", "Cancelled"] }
    })
      .populate("customerId", "customerName customerPhone")
      .populate("products.product", "name price retailPrice category")
      .populate("deliveryBoy", "name phone")
      .sort({ updatedAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching assigned orders" });
  }
};

// @desc    Accept order (Placed -> Accepted)
// @route   PUT /api/accountant/orders/:orderNumber/accept
// @access  Private (Accountant/Admin)
exports.acceptOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ OrderNumber: req.params.orderNumber });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.orderStatus !== "Placed") {
      return res.status(400).json({ message: "Order is already accepted or processed" });
    }
    order.orderStatus = "Accepted";
    order.acceptedAt = new Date();
    order.accountantId = req.user._id;
    await order.save();
    
    res.status(200).json({ message: "Order accepted successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error accepting order" });
  }
};

// @desc    Assign delivery boy to order
// @route   PUT /api/accountant/orders/:orderNumber/assign
// @access  Private (Accountant/Admin)
exports.assignDeliveryBoy = async (req, res) => {
  try {
    const { deliveryBoyId } = req.body;
    if (!deliveryBoyId) {
      return res.status(400).json({ message: "Delivery boy ID is required" });
    }

    const dboy = await DeliveryBoy.findById(deliveryBoyId);
    if (!dboy) {
      return res.status(404).json({ message: "Delivery boy not found" });
    }

    const order = await Order.findOne({ OrderNumber: req.params.orderNumber });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = "Assigned";
    order.deliveryBoy = dboy._id;
    order.assignedAt = new Date();
    await order.save();

    // Add to delivery boy's order history if not present
    if (!dboy.orderHistory.includes(order._id)) {
      dboy.orderHistory.push(order._id);
      await dboy.save();
    }

    res.status(200).json({ message: "Delivery boy assigned successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error assigning delivery boy" });
  }
};

// @desc    Get all delivery boys
// @route   GET /api/accountant/delivery-boys
// @access  Private (Accountant/Admin)
exports.getAllDeliveryBoys = async (req, res) => {
  try {
    const boys = await DeliveryBoy.find({ isActive: true }).select("name phone isAvailable");
    res.status(200).json({ deliveryBoys: boys });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching delivery boys" });
  }
};
