import Customer from "../model/Customer.model.js";
import Transaction from "../model/Transaction.model.js";

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.user.userId });

    const customersWithBalance = await Promise.all(
      customers.map(async (customer) => {
        const transactions = await Transaction.find({
          customerId: customer._id,
        });

        let balance = 0;
        transactions.forEach((transaction) => {
          if (transaction.type === "credit") {
            balance += transaction.amount;
          } else {
            balance -= transaction.amount;
          }
        });

        return {
          ...customer.toObject(),
          balance,
        };
      })
    );

    res.json(customersWithBalance);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    // Get all customers for this user
    const customers = await Customer.find({ userId: req.user.userId });
    const totalCustomers = customers.length;

    // Get all transactions for this user
    const transactions = await Transaction.find({ userId: req.user.userId });

    // Calculate total debit and credit amounts
    let totalDebitAmount = 0;
    let totalCreditAmount = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "debit") {
        totalDebitAmount += transaction.amount;
      } else if (transaction.type === "credit") {
        totalCreditAmount += transaction.amount;
      }
    });

    // Calculate net balance (credit - debit)
    const netBalance = totalCreditAmount - totalDebitAmount;

    res.json({
      totalCustomers,
      totalDebitAmount,
      totalCreditAmount,
      netBalance,
      transactions: transactions.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const customer = new Customer({
      name,
      phone,
      userId: req.user.userId,
      userEmail: req.user.email,
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;
    const customer = await Customer.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { name, phone },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    // Optionally delete all transactions for this customer
    await Transaction.deleteMany({ customerId: id });
    res.json({ message: "Customer and related transactions deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
