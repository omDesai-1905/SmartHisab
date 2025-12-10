import Customer from "../../user/models/Customer.model.js";
import Transaction from "../../user/models/Transaction.model.js";
import CustomerMessage from "../models/CustomerMessage.model.js";
import jwt from "jsonwebtoken";

export const customerLogin = async (req, res) => {
  try {
    const { customerId, password } = req.body;

    const customer = await Customer.findOne({ customerId });

    if (!customer) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (customer.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { customerId: customer._id, customerId_username: customer.customerId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      customer: {
        _id: customer._id,
        name: customer.name,
        customerId: customer.customerId,
        phone: customer.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCustomerTransactions = async (req, res) => {
  try {
    const customerId = req.customer.customerId;

    const transactions = await Transaction.find({ customerId }).sort({
      date: -1,
    });

    let balance = 0;
    const transactionsWithBalance = transactions.map((transaction) => {
      if (transaction.type === "credit") {
        balance += transaction.amount;
      } else {
        balance -= transaction.amount;
      }
      return {
        ...transaction.toObject(),
        runningBalance: balance,
      };
    });

    transactionsWithBalance.reverse();

    res.json({
      transactions: transactionsWithBalance,
      totalBalance: balance,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const sendDisputeMessage = async (req, res) => {
  try {
    const { transactionId, subject, message } = req.body;
    const customerId = req.customer.customerId;

    const customer = await Customer.findById(customerId);
    const transaction = await Transaction.findById(transactionId);

    if (
      !transaction ||
      transaction.customerId.toString() !== customerId.toString()
    ) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const disputeMessage = new CustomerMessage({
      customerId: customer._id,
      customerName: customer.name,
      userId: customer.userId,
      userEmail: customer.userEmail,
      transactionId,
      subject,
      message,
    });

    await disputeMessage.save();

    res.status(201).json({
      message: "Dispute message sent successfully to the user",
      disputeMessage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCustomerProfile = async (req, res) => {
  try {
    const customerId = req.customer.customerId;
    const customer = await Customer.findById(customerId).select("-password");

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCustomerMessages = async (req, res) => {
  try {
    const customerId = req.customer.customerId;

    const messages = await CustomerMessage.find({ customerId }).sort({
      createdAt: -1,
    });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const sendCustomerMessage = async (req, res) => {
  try {
    const { subject, message, type } = req.body;
    const customerId = req.customer.customerId;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const newMessage = new CustomerMessage({
      customerId: customer._id,
      customerName: customer.name,
      userId: customer.userId,
      userEmail: customer.userEmail,
      subject,
      message,
      type: type || "general",
    });

    await newMessage.save();

    res.status(201).json({
      message: "Message sent successfully to the business owner",
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
