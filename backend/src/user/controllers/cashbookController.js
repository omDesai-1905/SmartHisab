import Cashbook from "../models/Cashbook.model.js";

// Get all cashbook entries for a user
export const getCashbookEntries = async (req, res) => {
  try {
    const entries = await Cashbook.find({ userId: req.user.userId }).sort({
      date: -1,
      createdAt: -1,
    });
    res.json(entries);
  } catch (error) {
    console.error("Error fetching cashbook entries:", error);
    res.status(500).json({ error: "Server error while fetching entries" });
  }
};

// Add new cashbook entry
export const createCashbookEntry = async (req, res) => {
  try {
    const { type, amount, description, date } = req.body;

    const newEntry = new Cashbook({
      userId: req.user.userId,
      userEmail: req.user.email,
      type,
      amount: parseFloat(amount),
      description: description.trim(),
      date: new Date(date),
    });

    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    console.error("Error creating cashbook entry:", error);
    res.status(500).json({ error: "Server error while creating entry" });
  }
};

// Update cashbook entry
export const updateCashbookEntry = async (req, res) => {
  try {
    const { type, amount, description, date } = req.body;

    const entry = await Cashbook.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    entry.type = type;
    entry.amount = parseFloat(amount);
    entry.description = description.trim();
    entry.date = new Date(date);
    entry.userEmail = req.user.email; // Ensure userEmail is updated

    const updatedEntry = await entry.save();
    res.json(updatedEntry);
  } catch (error) {
    console.error("Error updating cashbook entry:", error);
    res.status(500).json({ error: "Server error while updating entry" });
  }
};

// Delete cashbook entry
export const deleteCashbookEntry = async (req, res) => {
  try {
    const entry = await Cashbook.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    await Cashbook.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting cashbook entry:", error);
    res.status(500).json({ error: "Server error while deleting entry" });
  }
};

// Get cashbook summary/analytics
export const getCashbookSummary = async (req, res) => {
  try {
    const entries = await Cashbook.find({ userId: req.user.userId });

    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
      totalEntries: entries.length,
      incomeEntries: 0,
      expenseEntries: 0,
    };

    entries.forEach((entry) => {
      if (entry.type === "income") {
        summary.totalIncome += entry.amount;
        summary.incomeEntries++;
      } else if (entry.type === "expense") {
        summary.totalExpense += entry.amount;
        summary.expenseEntries++;
      }
    });

    summary.netBalance = summary.totalIncome - summary.totalExpense;

    res.json(summary);
  } catch (error) {
    console.error("Error fetching cashbook summary:", error);
    res.status(500).json({ error: "Server error while fetching summary" });
  }
};

// Delete multiple cashbook entries
export const deleteMultipleCashbookEntries = async (req, res) => {
  try {
    const { entryIds } = req.body;

    if (!entryIds || !Array.isArray(entryIds) || entryIds.length === 0) {
      return res.status(400).json({ error: "No entry IDs provided" });
    }

    // Find entries to verify they belong to this user
    const entries = await Cashbook.find({
      _id: { $in: entryIds },
    });

    // Check if all entries belong to this user
    const unauthorized = entries.some(
      (entry) => entry.userId.toString() !== req.user.userId,
    );

    if (unauthorized) {
      return res.status(403).json({
        error: "Unauthorized to delete one or more entries",
      });
    }

    // Delete all entries
    const result = await Cashbook.deleteMany({
      _id: { $in: entryIds },
      userId: req.user.userId,
    });

    res.json({
      message: `${result.deletedCount} entry/entries deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting cashbook entries:", error);
    res.status(500).json({ error: "Server error while deleting entries" });
  }
};
