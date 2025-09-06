import express from "express";
import {
  createMessage,
  getUserMessages,
} from "../controllers/messageController.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import { validateMessage } from "../admin/middlewares/adminValidation.js";

const router = express.Router();

// User message routes
router.post("/", authenticateToken, validateMessage, createMessage);
router.get("/", authenticateToken, getUserMessages);

export default router;
