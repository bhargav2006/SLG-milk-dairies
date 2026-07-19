const Notification = require("../models/Notification");
const User = require("../models/User");
const { getIO } = require("./socket");

/**
 * Creates a notification in the database and broadcasts it in real-time.
 * 
 * @param {Object} params
 * @param {string} params.recipientId - Target user ID (only required/used for specific recipients like customers)
 * @param {string} params.recipientType - Role of recipient ('customer', 'accountant', 'admin', 'deliveryBoy')
 * @param {string} params.title - Alert Title
 * @param {string} params.message - Detailed text
 * @param {string} params.type - Category: 'info' | 'success' | 'warning' | 'error'
 * @param {string} params.referenceId - Associated Order or Bill object ID
 * @param {string} params.from - Origin role: 'customer' | 'accountant' | 'admin' | 'deliveryBoy'
 */
const sendNotification = async ({
  recipientId,
  recipientType,
  title,
  message,
  type = "info",
  referenceId = null,
  from,
}) => {
  try {
    const io = getIO();

    if (recipientType === "accountant" || recipientType === "admin") {
      // Find all staff users (accountants & admins) to create DB records for each
      const staffUsers = await User.find({ role: { $in: ["accountant", "admin"] } });
      const notifications = [];

      for (const staff of staffUsers) {
        notifications.push({
          recipientId: staff._id,
          recipientType: staff.role,
          title,
          message,
          type,
          referenceId,
          from,
          at: new Date(),
        });
      }

      if (notifications.length > 0) {
        // Bulk insert so all staff members get a copy in their inbox
        await Notification.insertMany(notifications);
      }

      // Send to the accountants socket room in real-time
      if (io) {
        io.to("accountants").emit("new_notification", {
          title,
          message,
          type,
          referenceId,
          from,
          at: new Date(),
        });
      }
      return notifications;
    } else {
      // Single recipient notification (e.g. customer or delivery boy)
      if (!recipientId) {
        throw new Error("recipientId is required for single recipient notification");
      }

      const notification = new Notification({
        recipientId,
        recipientType,
        title,
        message,
        type,
        referenceId,
        from,
        at: new Date(),
      });
      await notification.save();

      // Emit to the specific user's socket room
      if (io) {
        io.to(recipientId.toString()).emit("new_notification", notification);
      }
      return notification;
    }
  } catch (error) {
    console.error("Error creating/sending notification:", error);
  }
};

module.exports = {
  sendNotification,
};
