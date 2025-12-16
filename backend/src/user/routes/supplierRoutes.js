import express from "express";
import {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierTransactions,
  addSupplierTransaction,
  updateSupplierTransaction,
  deleteSupplierTransaction,
} from "../controllers/suppliersController.js";
import {
  validateSupplierCreation,
  validateSupplierUpdate,
  validateSupplierTransactionCreation,
  validateSupplierTransactionUpdate,
} from "../middlewares/supplierValidation.js";

const router = express.Router();

// Supplier CRUD routes
router.get("/", getAllSuppliers);
router.post("/", validateSupplierCreation, createSupplier);
router.post("/:id", validateSupplierUpdate, updateSupplier);
router.delete("/:id", deleteSupplier);

// Supplier transaction routes
router.get("/:id/transactions", getSupplierTransactions);
router.post(
  "/:id/transactions",
  validateSupplierTransactionCreation,
  addSupplierTransaction
);
router.post(
  "/:id/transactions/:transactionId",
  validateSupplierTransactionUpdate,
  updateSupplierTransaction
);
router.delete("/:id/transactions/:transactionId", deleteSupplierTransaction);

export default router;
