import express from "express";
import {
  register,
  login,
  logout,
  verifyToken,
  updateProfilePic,
  forgotPassword,
  resetPassword,
  forgotEnrollmentNo,
  recoverEnrollmentNo,
} from "../controllers/auth.js";
import { validateToken } from "../middleware/validateTokenHandler.js";

const router = express.Router();

// Auth Routes
router.post("/register", register);
router.post("/login", login);
router.get("/verify", verifyToken);
router.post("/logout", logout);
router.put("/update-profile", validateToken, updateProfilePic);

// ✅ Password Reset Routes
router.post("/forgot-password", forgotPassword); // Step 1: Send reset email
router.post("/reset-password/:token", resetPassword); // Step 2: Update password via token

//forgot enroll
router.post("/forgot-enrollment", forgotEnrollmentNo);
router.get("/recover-enrollment/:token", recoverEnrollmentNo);

export default router;
