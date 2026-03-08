import express from "express";
import {
  customerLogin,
  getCustomerTransactions,
  sendDisputeMessage,
  getCustomerProfile,
  getCustomerMessages,
  sendCustomerMessage,
  getCustomerChat,
  sendCustomerChatMessage,
} from "../controllers/customerPortalController.js";
import { customerAuthMiddleware } from "../middlewares/customerAuthMiddleware.js";

const router = express.Router();

router.post("/login", customerLogin);

router.get("/profile", customerAuthMiddleware, getCustomerProfile);

router.get("/transactions", customerAuthMiddleware, getCustomerTransactions);

router.post("/dispute", customerAuthMiddleware, sendDisputeMessage);

router.get("/messages", customerAuthMiddleware, getCustomerMessages);

router.post("/send-message", customerAuthMiddleware, sendCustomerMessage);

router.get("/chat", customerAuthMiddleware, getCustomerChat);

router.post("/chat", customerAuthMiddleware, sendCustomerChatMessage);

export default router;
