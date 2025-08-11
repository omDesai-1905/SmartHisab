import express from "express";
import Cashbook from "../model/Cashbook.model.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all cashbook entries for a user
router.get("/", authMiddleware, async (req, res) => {
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
});

// Add new cashbook entry
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { type, amount, description, date } = req.body;

    // Validation
    if (!type || !amount || !description || !date) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!["income", "expense"].includes(type)) {
      return res
        .status(400)
        .json({ error: "Type must be either income or expense" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    const newEntry = new Cashbook({
      userId: req.user.userId,
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
});

// Update cashbook entry
router.post("/:id", authMiddleware, async (req, res) => {
  try {
    const { type, amount, description, date } = req.body;

    // Validation
    if (!type || !amount || !description || !date) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!["income", "expense"].includes(type)) {
      return res
        .status(400)
        .json({ error: "Type must be either income or expense" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

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

    const updatedEntry = await entry.save();
    res.json(updatedEntry);
  } catch (error) {
    console.error("Error updating cashbook entry:", error);
    res.status(500).json({ error: "Server error while updating entry" });
  }
});

// Delete cashbook entry
router.delete("/:id", authMiddleware, async (req, res) => {
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
});

// Get cashbook summary/analytics
router.get("/summary", authMiddleware, async (req, res) => {
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
});

export default router;
