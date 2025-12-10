import jwt from "jsonwebtoken";
import User from "../../user/models/User.model.js";
import Customer from "../../user/models/Customer.model.js";
import Transaction from "../../user/models/Transaction.model.js";
import Cashbook from "../../user/models/Cashbook.model.js";
import Message from "../../user/models/Message.model.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if it's admin credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

    // Generate admin token
    const token = jwt.sign({ isAdmin: true, email: ADMIN_EMAIL }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token,
      admin: {
        email: ADMIN_EMAIL,
        isAdmin: true,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify admin token
export const verifyAdminToken = async (req, res) => {
  try {
    const token = req.header("Authorization");

    if (!token || !token.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ valid: false, message: "No token provided" });
    }

    const actualToken = token.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = jwt.verify(actualToken, JWT_SECRET);

    if (!decoded.isAdmin) {
      return res
        .status(401)
        .json({ valid: false, message: "Not authorized as admin" });
    }

    res.json({
      valid: true,
      admin: {
        email: decoded.email,
        isAdmin: true,
      },
    });
  } catch (error) {
    res.status(401).json({ valid: false, message: "Invalid token" });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ isRead: false });

    res.json({
      totalUsers,
      totalMessages,
      unreadMessages,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      {
        password: 0, // Exclude password field
      }
    ).sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user details with statistics
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user info
    const user = await User.findById(userId, { password: 0 });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get customer count
    const totalCustomers = await Customer.countDocuments({ userId });

    // Get transaction statistics
    const transactions = await Transaction.find({ userId });

    let totalDebit = 0;
    let totalCredit = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "debit") {
        totalDebit += transaction.amount;
      } else if (transaction.type === "credit") {
        totalCredit += transaction.amount;
      }
    });

    const netAmount = totalCredit - totalDebit;

    // Get cashbook statistics
    const cashbookEntries = await Cashbook.find({ userId });

    let totalIncome = 0;
    let totalExpense = 0;

    cashbookEntries.forEach((entry) => {
      if (entry.type === "income") {
        totalIncome += entry.amount;
      } else if (entry.type === "expense") {
        totalExpense += entry.amount;
      }
    });

    const netIncomeExpense = totalIncome - totalExpense;

    res.json({
      user,
      statistics: {
        totalCustomers,
        totalDebit,
        totalCredit,
        netAmount,
        totalIncome,
        totalExpense,
        netIncomeExpense,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all messages
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find({})
      .populate("userId", "name email mobileNumber businessName")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    ).populate("userId", "name email mobileNumber businessName");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark message as unread
export const markMessageAsUnread = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: false },
      { new: true }
    ).populate("userId", "name email mobileNumber businessName");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
