const Notification = require("../models/Notification");

// @desc    Get staff notifications (recent 50)
// @route   GET /api/notifications/staff
// @access  Private (Admin/Accountant)
exports.getStaffNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user._id,
      recipientType: { $in: ["accountant", "admin"] }
    })
      .sort({ at: -1 })
      .limit(50);

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Get Staff Notifications Error:", error);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
};

// @desc    Get customer notifications (recent 50)
// @route   GET /api/notifications/customer
// @access  Private (Customer)
exports.getCustomerNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.customer._id,
      recipientType: "customer"
    })
      .sort({ at: -1 })
      .limit(50);

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Get Customer Notifications Error:", error);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
};

// @desc    Mark single staff notification as read
// @route   PUT /api/notifications/staff/:id/read
// @access  Private (Admin/Accountant)
exports.markStaffNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Mark Staff Notification Error:", error);
    res.status(500).json({ message: "Server error updating notification" });
  }
};

// @desc    Mark single customer notification as read
// @route   PUT /api/notifications/customer/:id/read
// @access  Private (Customer)
exports.markCustomerNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.customer._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Mark Customer Notification Error:", error);
    res.status(500).json({ message: "Server error updating notification" });
  }
};

// @desc    Mark all staff notifications as read
// @route   PUT /api/notifications/staff/read-all
// @access  Private (Admin/Accountant)
exports.markAllStaffNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark All Staff Notifications Error:", error);
    res.status(500).json({ message: "Server error updating notifications" });
  }
};

// @desc    Mark all customer notifications as read
// @route   PUT /api/notifications/customer/read-all
// @access  Private (Customer)
exports.markAllCustomerNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.customer._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark All Customer Notifications Error:", error);
    res.status(500).json({ message: "Server error updating notifications" });
  }
};
