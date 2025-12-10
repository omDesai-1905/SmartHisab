import express from "express";
import CustomerMessage from "../../customer/models/CustomerMessage.model.js";

const router = express.Router();

// Get all customer messages for the logged-in user
router.get("/customer-messages", async (req, res) => {
  try {
    const userId = req.user.userId;

    const messages = await CustomerMessage.find({ userId })
      .populate("customerId", "name phone customerId")
      .sort({ createdAt: -1 });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Reply to a customer message
router.post("/customer-messages/:messageId/reply", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reply } = req.body;
    const userId = req.user.userId;

    const message = await CustomerMessage.findOne({ _id: messageId, userId });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.reply = reply;
    message.status = "in-progress";
    await message.save();

    res.json({ message: "Reply sent successfully", data: message });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update message status
router.patch("/customer-messages/:messageId/status", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const message = await CustomerMessage.findOne({ _id: messageId, userId });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.status = status;
    await message.save();

    res.json({ message: "Status updated successfully", data: message });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
