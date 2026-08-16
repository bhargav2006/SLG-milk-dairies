const Branch = require("../models/Branch");

// @desc    Get all branches
// @route   GET /api/branches
// @access  Private
const getBranches = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const filter = {};
    if (activeOnly === "true") {
      filter.isActive = true;
    }

    const branches = await Branch.find(filter).sort({ isMain: -1, createdAt: 1 });
    res.json(branches);
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single branch by ID
// @route   GET /api/branches/:id
// @access  Private
const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }
    res.json(branch);
  } catch (error) {
    console.error("Error fetching branch:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new branch (Admin only)
// @route   POST /api/branches
// @access  Private/Admin
const createBranch = async (req, res) => {
  try {
    const { name, code, address, phone, isMain } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: "Branch name and code are required" });
    }

    const uppercaseCode = code.trim().toUpperCase();

    // Check if code exists
    const codeExists = await Branch.findOne({ code: uppercaseCode });
    if (codeExists) {
      return res.status(400).json({ message: "Branch code already exists" });
    }

    // If marked as main, unset previous main branch
    if (isMain) {
      await Branch.updateMany({ isMain: true }, { isMain: false });
    }

    const branch = await Branch.create({
      name,
      code: uppercaseCode,
      address: address || "",
      phone: phone || "",
      isMain: !!isMain,
      isActive: true,
    });

    res.status(201).json(branch);
  } catch (error) {
    console.error("Error creating branch:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update branch (Admin only)
// @route   PUT /api/branches/:id
// @access  Private/Admin
const updateBranch = async (req, res) => {
  try {
    const { name, code, address, phone, isMain, isActive } = req.body;

    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    if (code && code.trim().toUpperCase() !== branch.code) {
      const uppercaseCode = code.trim().toUpperCase();
      const codeExists = await Branch.findOne({ code: uppercaseCode });
      if (codeExists) {
        return res.status(400).json({ message: "Branch code already exists" });
      }
      branch.code = uppercaseCode;
    }

    if (name) branch.name = name;
    if (address !== undefined) branch.address = address;
    if (phone !== undefined) branch.phone = phone;
    if (isActive !== undefined) branch.isActive = isActive;

    if (isMain && !branch.isMain) {
      await Branch.updateMany({ isMain: true }, { isMain: false });
      branch.isMain = true;
    }

    await branch.save();
    res.json(branch);
  } catch (error) {
    console.error("Error updating branch:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete/Deactivate branch (Admin only)
// @route   DELETE /api/branches/:id
// @access  Private/Admin
const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    if (branch.isMain) {
      return res.status(400).json({ message: "Cannot delete the Main Branch" });
    }

    branch.isActive = false;
    await branch.save();

    res.json({ message: `Branch '${branch.name}' deactivated successfully` });
  } catch (error) {
    console.error("Error deleting branch:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
};
