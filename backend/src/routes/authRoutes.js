import express from "express";
import {
  signup,
  login,
  verifyToken,
  updateProfile,
  deleteAccount,
} from "../controllers/authController.js";
import {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
} from "../middlewares/authValidation.js";

const router = express.Router();

router.post("/signup", validateRegistration, signup);
router.post("/login", validateLogin, login);
router.get("/verify-token", verifyToken);
router.post("/profile", validateProfileUpdate, updateProfile);
router.delete("/delete-account", deleteAccount);

export default router;
