const express = require("express");
const router = express.Router();

const { register, login, logout, changePassword, updateProfileImage, getAllUsers, toggleUserStatus, deleteUser } = require("../controller/authController");
const { verifyPassword } = require("../controller/verifyController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/logout", logout);
router.put("/auth/change-password", authMiddleware, changePassword);
router.put("/auth/update-profile-image", authMiddleware, updateProfileImage);
router.post("/auth/verify-password", authMiddleware, verifyPassword);
router.get("/auth/users", authMiddleware, getAllUsers);
router.put("/auth/users/:userId/toggle-status", authMiddleware, toggleUserStatus);
router.delete("/auth/users/:userId", authMiddleware, deleteUser);

module.exports = router;
