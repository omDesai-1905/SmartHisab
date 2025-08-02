import express from "express";
import {
  signup,
  login,
  verifyToken,
  updateProfile,
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
router.put("/profile", validateProfileUpdate, updateProfile);

export default router;
