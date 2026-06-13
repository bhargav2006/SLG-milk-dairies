const User = require("../models/User");

// @desc    Get all users (admin only)
// @route   GET /api/users/
const getAllUsers = async (req, res) => {
  try {
    // console.log("Authenticated user:", req.user); // Log the authenticated user
    // console.log("Fetched users:", users); // Log the fetched users
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, admin only" });
    }
    const users = await User.find().select("-password"); // exclude password
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a user (admin only)
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        message: "Cannot delete yourself",
      });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, admin only" });
    }
    await user.deleteOne();
    res.json({ message: `${user.name} deleted` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllUsers, deleteUser };
