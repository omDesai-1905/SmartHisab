import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateCashbookEntry,
  validateCashbookEntryId,
} from "../middlewares/cashbookValidation.js";
import {
  getCashbookEntries,
  createCashbookEntry,
  updateCashbookEntry,
  deleteCashbookEntry,
  getCashbookSummary,
} from "../controllers/cashbookController.js";

const router = express.Router();

// Get all cashbook entries for a user
router.get("/", authMiddleware, getCashbookEntries);

// Add new cashbook entry
router.post("/", authMiddleware, validateCashbookEntry, createCashbookEntry);

// Update cashbook entry
router.post(
  "/:id",
  authMiddleware,
  validateCashbookEntryId,
  validateCashbookEntry,
  updateCashbookEntry
);

// Delete cashbook entry
router.delete(
  "/:id",
  authMiddleware,
  validateCashbookEntryId,
  deleteCashbookEntry
);

// Get cashbook summary/analytics
router.get("/summary", authMiddleware, getCashbookSummary);

export default router;
