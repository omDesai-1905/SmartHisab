import express from "express";
import {
  getChatList,
  getChatMessages,
  sendChatMessage,
  markMessagesAsRead,
  deleteMultipleMessages,
} from "../controllers/chatController.js";

const router = express.Router();

// GET - Fetch all customers with their last message (chat list)
router.get("/chat-list", getChatList);

// POST - Delete multiple messages (MUST be before :customerId routes)
router.post("/chat/delete-multiple", deleteMultipleMessages);

// GET - Fetch chat messages between user and specific customer
router.get("/chat/:customerId", getChatMessages);

// POST - Send a chat message from user to customer
router.post("/chat/:customerId", sendChatMessage);

// PATCH - Mark messages as read
router.patch("/chat/:customerId", markMessagesAsRead);

export default router;
