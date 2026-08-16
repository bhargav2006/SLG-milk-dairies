const Branch = require("../models/Branch");
const User = require("../models/User");
const Product = require("../models/Product");
const Bill = require("../models/Bill");
const Order = require("../models/Order");
const DeliveryBoy = require("../models/DeliveryBoy");

const initBranches = async () => {
  try {
    let mainBranch = await Branch.findOne({ isMain: true });

    if (!mainBranch) {
      // Check if any branch exists at all
      mainBranch = await Branch.findOne({ code: "MAIN" });
      if (!mainBranch) {
        mainBranch = await Branch.create({
          name: "Main Branch",
          code: "MAIN",
          address: "Main Dairy Headquarters",
          phone: "",
          isMain: true,
          isActive: true,
        });
        console.log("--> Main Branch initialized (code: MAIN)");
      } else {
        mainBranch.isMain = true;
        await mainBranch.save();
      }
    }

    // Attach Main Branch to any unassigned Users, Products, Bills, Orders, Delivery Boys
    const userUpdate = await User.updateMany(
      { branch: { $exists: false } },
      { $set: { branch: mainBranch._id } }
    );

    const productUpdate = await Product.updateMany(
      { branch: { $exists: false } },
      { $set: { branch: mainBranch._id } }
    );

    const billUpdate = await Bill.updateMany(
      { branch: { $exists: false } },
      { $set: { branch: mainBranch._id } }
    );

    const orderUpdate = await Order.updateMany(
      { branch: { $exists: false } },
      { $set: { branch: mainBranch._id } }
    );

    const deliveryBoyUpdate = await DeliveryBoy.updateMany(
      { branch: { $exists: false } },
      { $set: { branch: mainBranch._id } }
    );

    // Safely drop legacy global serialNumber_1 unique index if it exists
    try {
      await Product.collection.dropIndex("serialNumber_1");
      console.log("--> Dropped legacy serialNumber_1 index in favour of compound branch index.");
    } catch (err) {
      // Index might already be dropped or not exist
    }

    if (
      userUpdate.modifiedCount ||
      productUpdate.modifiedCount ||
      billUpdate.modifiedCount ||
      orderUpdate.modifiedCount ||
      deliveryBoyUpdate.modifiedCount
    ) {
      console.log(
        `--> Legacy records linked to Main Branch: ${productUpdate.modifiedCount} products, ${billUpdate.modifiedCount} bills, ${userUpdate.modifiedCount} users.`
      );
    }
  } catch (error) {
    console.error("Failed to initialize branches:", error);
  }
};

module.exports = initBranches;
