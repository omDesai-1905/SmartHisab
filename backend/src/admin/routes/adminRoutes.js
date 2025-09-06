import express from "express";
import {
  adminLogin,
  verifyAdminToken,
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  getAllMessages,
  markMessageAsRead,
  markMessageAsUnread,
} from "../controllers/adminController.js";
import authenticateAdmin from "../middlewares/adminMiddleware.js";
import { validateAdminLogin } from "../middlewares/adminValidation.js";

const router = express.Router();

// Public admin routes
router.post("/login", validateAdminLogin, adminLogin);
router.get("/verify-token", verifyAdminToken);

// Protected admin routes
router.get("/dashboard-stats", authenticateAdmin, getDashboardStats);
router.get("/users", authenticateAdmin, getAllUsers);
router.get("/users/:userId", authenticateAdmin, getUserDetails);
router.get("/messages", authenticateAdmin, getAllMessages);
router.patch("/messages/:messageId/read", authenticateAdmin, markMessageAsRead);
router.patch(
  "/messages/:messageId/unread",
  authenticateAdmin,
  markMessageAsUnread
);

export default router;
