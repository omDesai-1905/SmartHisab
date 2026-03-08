import CustomerMessage from "../../customer/models/CustomerMessage.model.js";
import Customer from "../models/Customer.model.js";

// GET - Fetch all customers with their last message (chat list)
export const getChatList = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all customers for this user
    const customers = await Customer.find({ userId }).select("_id name phone");

    // Get the last message and unread count for each customer
    const chatList = await Promise.all(
      customers.map(async (customer) => {
        const lastMessage = await CustomerMessage.findOne({
          customerId: customer._id,
          userId: userId,
          type: "chat",
        }).sort({ createdAt: -1 });

        const unreadCount = await CustomerMessage.countDocuments({
          customerId: customer._id,
          userId: userId,
          type: "chat",
          senderType: "customer",
          isRead: false,
        });

        return {
          customerId: customer._id,
          customerName: customer.name,
          customerPhone: customer.phone,
          lastMessage: lastMessage
            ? {
                message: lastMessage.message,
                timestamp: lastMessage.createdAt,
                senderType: lastMessage.senderType,
                isRead: lastMessage.isRead,
              }
            : null,
          unreadCount,
        };
      }),
    );

    // Sort by last message timestamp (most recent first)
    chatList.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
      );
    });

    res.json({ chatList });
  } catch (error) {
    console.error("Error fetching chat list:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET - Fetch chat messages between user and specific customer
export const getChatMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { customerId } = req.params;

    // Fetch all chat messages between this user and customer
    const messages = await CustomerMessage.find({
      userId: userId,
      customerId: customerId,
      type: "chat",
    }).sort({ createdAt: 1 }); // Oldest first for chat

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST - Send a chat message from user to customer
export const sendChatMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userEmail = req.user.email;
    const { customerId } = req.params;
    const { message } = req.body;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Create new chat message
    const newMessage = new CustomerMessage({
      customerId: customer._id,
      customerName: customer.name,
      userId: userId,
      userEmail: userEmail,
      message,
      type: "chat",
      sender: "user",
      senderType: "user",
      senderId: userId,
      readBy: [],
    });

    await newMessage.save();

    res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending chat message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PATCH - Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { customerId } = req.params;

    // Mark all unread messages from this customer as read
    await CustomerMessage.updateMany(
      {
        userId: userId,
        customerId: customerId,
        senderType: "customer",
        isRead: false,
      },
      { isRead: true },
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST - Delete multiple messages (only by user)
export const deleteMultipleMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: "No message IDs provided" });
    }

    // Find messages to verify they belong to this user
    const messages = await CustomerMessage.find({
      _id: { $in: messageIds },
    });

    // Check if all messages belong to this user's conversations
    const unauthorized = messages.some(
      (msg) => msg.userId.toString() !== userId,
    );

    if (unauthorized) {
      return res.status(403).json({
        message: "Unauthorized to delete one or more messages",
      });
    }

    // Delete all messages
    const result = await CustomerMessage.deleteMany({
      _id: { $in: messageIds },
      userId: userId,
    });

    res.json({
      message: `${result.deletedCount} message(s) deleted successfully`,
      deletedCount: result.deletedCount,
      messageIds: messageIds,
    });
  } catch (error) {
    console.error("Error deleting messages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
