const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const { getAllUsers, deleteUser, createUser, updateUser } = require("../controllers/userController");

// Example protected route
router.get("/profile", protect, (req, res) => {
  res.json({
    user: req.user, // this comes from the middleware
    message: "You are authorized",
  });
});

// Admin-only route to get all users
router.get("/", protect, admin, getAllUsers);

// Admin-only route to create a user
router.post("/", protect, admin, createUser);

// Admin-only route to update a user
router.put("/:id", protect, admin, updateUser);

// Admin-only route to delete a user
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
