const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} = require("../controllers/branchController");

router.route("/")
  .get(protect, getBranches)
  .post(protect, admin, createBranch);

router.route("/:id")
  .get(protect, getBranchById)
  .put(protect, admin, updateBranch)
  .delete(protect, admin, deleteBranch);

module.exports = router;
