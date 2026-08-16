const User = require("../models/User");
const Branch = require("../models/Branch");

// @desc    Get all users (admin only)
// @route   GET /api/users/
const getAllUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, admin only" });
    }
    const users = await User.find().select("-password").populate("branch", "name code"); // exclude password
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

// @desc    Create a new user (admin only)
// @route   POST /api/users/
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, branch } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    let targetBranch = branch;
    if (!targetBranch && role !== "admin") {
      const mainBranch = await Branch.findOne({ isMain: true });
      if (mainBranch) targetBranch = mainBranch._id;
    }

    const user = new User({
      name,
      email,
      password,
      role,
      phone: phone || "",
      branch: targetBranch || null,
    });
    await user.save();
    
    const populatedUser = await User.findById(user._id).select("-password").populate("branch", "name code");
    res.status(201).json(populatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a user (admin only)
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, email, role, password, phone, branch } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email is already in use by another user" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (password) user.password = password;
    if (phone !== undefined) user.phone = phone;
    if (branch !== undefined) user.branch = branch || null;

    await user.save();

    const populatedUser = await User.findById(user._id).select("-password").populate("branch", "name code");
    res.json(populatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllUsers, deleteUser, createUser, updateUser };
