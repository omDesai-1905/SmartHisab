import Message from "../model/Message.model.js";

// Create a new message
export const createMessage = async (req, res) => {
  try {
    const { emailAddress, topic, description } = req.body;
    const userId = req.user.userId;

    const message = new Message({
      userId,
      emailAddress,
      topic,
      description,
      // isRead defaults to false from schema
    });

    await message.save();
    console.log("Created message with isRead:", message.isRead);

    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user's messages
export const getUserMessages = async (req, res) => {
  try {
    const userId = req.user.userId;

    const messages = await Message.find({ userId }).sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
