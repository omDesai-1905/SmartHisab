import Supplier from "../models/suppliers.model.js";
import SupplierTransaction from "../models/SupplierTransaction.model.js";

// Get all suppliers for a user
export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ userId: req.user.userId });

    const suppliersWithBalance = await Promise.all(
      suppliers.map(async (supplier) => {
        const transactions = await SupplierTransaction.find({
          supplierId: supplier._id,
        });

        let balance = 0;
        transactions.forEach((transaction) => {
          if (transaction.type === "debit") {
            balance += transaction.amount;
          } else {
            balance -= transaction.amount;
          }
        });

        return {
          ...supplier.toObject(),
          balance,
        };
      }),
    );

    res.json(suppliersWithBalance);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create new supplier
export const createSupplier = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const supplier = new Supplier({
      name,
      phone,
      userId: req.user.userId,
      userEmail: req.user.email,
    });

    await supplier.save();

    res.status(201).json({
      _id: supplier._id,
      name: supplier.name,
      phone: supplier.phone,
      userId: supplier.userId,
      userEmail: supplier.userEmail,
      createdAt: supplier.createdAt,
      balance: 0,
      message: "Supplier created successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update supplier
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    const supplier = await Supplier.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { name, phone },
      { new: true },
    );

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete supplier
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Delete all transactions for this supplier
    await SupplierTransaction.deleteMany({ supplierId: id });

    res.json({ message: "Supplier and related transactions deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get supplier transactions
export const getSupplierTransactions = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify supplier belongs to user
    const supplier = await Supplier.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const transactions = await SupplierTransaction.find({
      supplierId: id,
    }).sort({ createdAt: -1 });

    res.json({ supplier, transactions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add supplier transaction
export const addSupplierTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, description, date } = req.body;

    // Verify supplier belongs to user
    const supplier = await Supplier.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const transaction = new SupplierTransaction({
      supplierId: id,
      supplierName: supplier.name,
      userId: req.user.userId,
      userEmail: req.user.email,
      type,
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date) : new Date(),
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update supplier transaction
export const updateSupplierTransaction = async (req, res) => {
  try {
    const { id, transactionId } = req.params;
    const { type, amount, description, date } = req.body;

    // Verify supplier belongs to user
    const supplier = await Supplier.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const updateData = { type, amount, description };
    if (date) {
      updateData.date = new Date(date);
    }

    const transaction = await SupplierTransaction.findOneAndUpdate(
      { _id: transactionId, supplierId: id, userId: req.user.userId },
      updateData,
      { new: true },
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete supplier transaction
export const deleteSupplierTransaction = async (req, res) => {
  try {
    const { id, transactionId } = req.params;

    // Verify supplier belongs to user
    const supplier = await Supplier.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const transaction = await SupplierTransaction.findOneAndDelete({
      _id: transactionId,
      supplierId: id,
      userId: req.user.userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete multiple supplier transactions
export const deleteMultipleSupplierTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionIds } = req.body;

    if (
      !transactionIds ||
      !Array.isArray(transactionIds) ||
      transactionIds.length === 0
    ) {
      return res.status(400).json({ message: "No transaction IDs provided" });
    }

    // Verify supplier belongs to user
    const supplier = await Supplier.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Find transactions to verify they belong to this supplier
    const transactions = await SupplierTransaction.find({
      _id: { $in: transactionIds },
    });

    // Check if all transactions belong to this supplier and user
    const unauthorized = transactions.some(
      (txn) =>
        txn.supplierId.toString() !== id ||
        txn.userId.toString() !== req.user.userId,
    );

    if (unauthorized) {
      return res.status(403).json({
        message: "Unauthorized to delete one or more transactions",
      });
    }

    // Delete all transactions
    const result = await SupplierTransaction.deleteMany({
      _id: { $in: transactionIds },
      supplierId: id,
      userId: req.user.userId,
    });

    res.json({
      message: `${result.deletedCount} transaction(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
