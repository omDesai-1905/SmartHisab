import Customer from "../model/Customer.model.js";
import Transaction from "../model/Transaction.model.js";

export const getCustomerTransactions = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: id,
      userId: req.user.userId,
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const transactions = await Transaction.find({ customerId: id }).sort({
      createdAt: -1,
    });

    res.json({ customer, transactions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, description, date } = req.body;

    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: id,
      userId: req.user.userId,
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const transaction = new Transaction({
      customerId: id,
      customerName: customer.name,
      userId: req.user.userId,
      userEmail: req.user.email,
      type,
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date) : new Date(), // Use provided date or current date
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id, transactionId } = req.params;
    const { type, amount, description, date } = req.body;
    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: id,
      userId: req.user.userId,
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const updateData = { type, amount, description };
    if (date) {
      updateData.date = new Date(date);
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, customerId: id, userId: req.user.userId },
      updateData,
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id, transactionId } = req.params;
    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: id,
      userId: req.user.userId,
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const transaction = await Transaction.findOneAndDelete({
      _id: transactionId,
      customerId: id,
      userId: req.user.userId,
    });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
