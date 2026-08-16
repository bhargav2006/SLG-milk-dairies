const Order = require("../models/Order");
const DeliveryBoy = require("../models/DeliveryBoy");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Coupon = require("../models/Coupon");
const Branch = require("../models/Branch");
const { createInvoiceFromOrder } = require("../utils/invoiceHelper");
const { sendNotification } = require("../utils/notificationHelper");

// Helper to resolve branch query for orders
const resolveOrderBranchQuery = async (req, baseFilter = {}) => {
  const query = { ...baseFilter };
  const mainBranch = await Branch.findOne({ isMain: true });

  if (req.user) {
    if (req.user.role === "accountant" || req.user.role === "branch_admin") {
      const userBranchId = req.user.branch?._id || req.user.branch;
      if (userBranchId) {
        query.$or = [
          { branch: userBranchId },
          // If accountant belongs to Main Branch, also show unassigned legacy orders
          ...(mainBranch && userBranchId.toString() === mainBranch._id.toString()
            ? [{ branch: { $exists: false } }, { branch: null }]
            : [])
        ];
      }
    } else if (req.user.role === "admin") {
      if (req.query.branchId && req.query.branchId !== "all") {
        query.branch = req.query.branchId;
      }
    }
  }
  return query;
};

// @desc    Get pending orders (status: Placed)
// @route   GET /api/accountant/orders/pending
// @access  Private (Accountant/Admin)
exports.getPendingOrders = async (req, res) => {
  try {
    const query = await resolveOrderBranchQuery(req, { orderStatus: "Placed" });
    const orders = await Order.find(query)
      .populate("customerId", "customerName customerPhone")
      .populate("products.product", "name price retailPrice category")
      .populate("branch", "name code")
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
    const query = await resolveOrderBranchQuery(req, { orderStatus: "Accepted" });
    const orders = await Order.find(query)
      .populate("customerId", "customerName customerPhone")
      .populate("products.product", "name price retailPrice category")
      .populate("branch", "name code")
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
    const query = await resolveOrderBranchQuery(req, {
      orderStatus: { $in: ["Assigned", "Out for Delivery", "Delivered", "Cancelled"] }
    });
    const orders = await Order.find(query)
      .populate("customerId", "customerName customerPhone")
      .populate("products.product", "name price retailPrice category")
      .populate("deliveryBoy", "name phone")
      .populate("accountantId", "name email phone")
      .populate("branch", "name code")
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

    // Send notification to customer
    await sendNotification({
      recipientId: order.customerId,
      recipientType: "customer",
      title: "Order Accepted",
      message: `Your order ${order.OrderNumber} has been accepted and is being processed.`,
      type: "success",
      referenceId: order._id,
      from: "accountant"
    });
    
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
    const { deliveryBoyId, isTemp, tempDeliveryBoyName, tempDeliveryBoyPhone } = req.body;

    const order = await Order.findOne({ OrderNumber: req.params.orderNumber });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (isTemp) {
      if (!tempDeliveryBoyName || !tempDeliveryBoyPhone) {
        return res.status(400).json({ message: "Temporary delivery boy name and phone are required" });
      }
      order.orderStatus = "Assigned";
      order.isTempDelivery = true;
      order.tempDeliveryBoy = {
        name: tempDeliveryBoyName,
        phone: tempDeliveryBoyPhone,
      };
      order.deliveryBoy = undefined;
      order.assignedAt = new Date();
      order.accountantId = req.user._id;
      await order.save();

      // Send notification to customer
      await sendNotification({
        recipientId: order.customerId,
        recipientType: "customer",
        title: "Delivery Agent Assigned 🚚",
        message: `Your order ${order.OrderNumber} has been assigned to temporary delivery agent ${tempDeliveryBoyName}.`,
        type: "info",
        referenceId: order._id,
        from: "accountant"
      });

      return res.status(200).json({ message: "Temporary delivery boy assigned successfully", order });
    }

    if (!deliveryBoyId) {
      return res.status(400).json({ message: "Delivery boy ID is required" });
    }

    const dboy = await DeliveryBoy.findById(deliveryBoyId);
    if (!dboy) {
      return res.status(404).json({ message: "Delivery boy not found" });
    }

    order.orderStatus = "Assigned";
    order.isTempDelivery = false;
    order.tempDeliveryBoy = { name: null, phone: null };
    order.deliveryBoy = dboy._id;
    order.assignedAt = new Date();
    order.accountantId = req.user._id;
    await order.save();

    // Add to delivery boy's order history if not present
    if (!dboy.orderHistory.includes(order._id)) {
      dboy.orderHistory.push(order._id);
      await dboy.save();
    }

    // Send notification to customer
    await sendNotification({
      recipientId: order.customerId,
      recipientType: "customer",
      title: "Delivery Agent Assigned 🚚",
      message: `Your order ${order.OrderNumber} has been assigned to delivery agent ${dboy.name}.`,
      type: "info",
      referenceId: order._id,
      from: "accountant"
    });

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

// @desc    Update order status directly by Accountant (verifying manually)
// @route   PUT /api/accountant/orders/:orderNumber/status
// @access  Private (Accountant/Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const validStatuses = ["Assigned", "Out for Delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status value" });
    }

    const order = await Order.findOne({ OrderNumber: req.params.orderNumber });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (["Delivered", "Cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({ message: `Order is already finalized as: ${order.orderStatus}` });
    }

    if (status === "Cancelled" && (!cancelReason || !cancelReason.trim())) {
      return res.status(400).json({ message: "Cancellation reason is required" });
    }

    order.orderStatus = status;

    if (status === "Delivered") {
      order.deliveryOtp = null; // Clear OTP since verified manually
      order.paymentStatus = "completed";
      order.deliveredAt = new Date();
    } else if (status === "Cancelled") {
      order.cancelledBy = req.user?.role || "accountant";
      order.canceledAt = new Date();
      order.cancelReason = cancelReason.trim();

      // Restore stock for all products
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }

      // Restore customer spend details
      if (order.customerId) {
        const customer = await Customer.findById(order.customerId);
        if (customer) {
          customer.totalSpent = Math.max(0, (customer.totalSpent || 0) - order.totalAmount);
          await customer.save();
        }
      }

      // Restore coupon usage if coupon was applied
      if (order.couponCode) {
        await Coupon.findOneAndUpdate(
          { code: order.couponCode },
          { $inc: { usedCount: -1 } }
        );
      }
    }

    await order.save();

    if (status === "Delivered") {
      await createInvoiceFromOrder(order);
    }

    // Send status change notification to customer
    let notifyTitle = "Order Update";
    let notifyMessage = `Your order ${order.OrderNumber} status has been updated to ${status}.`;
    let notifyType = "info";

    if (status === "Delivered") {
      notifyTitle = "Order Delivered 🎉";
      notifyMessage = `Your order ${order.OrderNumber} has been delivered successfully. Thank you for shopping with us!`;
      notifyType = "success";
    } else if (status === "Cancelled") {
      notifyTitle = "Order Cancelled ❌";
      notifyMessage = `Your order ${order.OrderNumber} was cancelled by the store. Reason: ${cancelReason || "Not specified"}.`;
      notifyType = "error";
    } else if (status === "Out for Delivery") {
      notifyTitle = "Order Out for Delivery 🚚";
      notifyMessage = `Your order ${order.OrderNumber} is now out for delivery and will reach you shortly.`;
      notifyType = "success";
    }

    await sendNotification({
      recipientId: order.customerId,
      recipientType: "customer",
      title: notifyTitle,
      message: notifyMessage,
      type: notifyType,
      referenceId: order._id,
      from: "accountant"
    });

    res.status(200).json({ message: `Order status updated to ${status} successfully`, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating order status" });
  }
};
