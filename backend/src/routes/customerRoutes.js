import express from "express";
import {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";
import {
  getCustomerTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";
import {
  validateCustomerCreation,
  validateCustomerUpdate,
} from "../middlewares/customerValidation.js";
import {
  validateTransactionCreation,
  validateTransactionUpdate,
} from "../middlewares/transactionValidation.js";

const router = express.Router();

router.get("/", getAllCustomers);
router.post("/", validateCustomerCreation, createCustomer);
router.get("/:id/transactions", getCustomerTransactions);
router.post("/:id/transactions", validateTransactionCreation, addTransaction);
router.put("/:id", validateCustomerUpdate, updateCustomer);
router.delete("/:id", deleteCustomer);
router.put(
  "/:id/transactions/:transactionId",
  validateTransactionUpdate,
  updateTransaction
);
router.delete("/:id/transactions/:transactionId", deleteTransaction);

export default router;
