import express from "express";
import {
  register,
  login,
  logout,
  verifyToken,
  updateProfilePic,
} from "../controllers/auth.js";
import { validateToken } from "../middleware/validateTokenHandler.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", verifyToken);
router.post("/logout", logout);
router.put("/update-profile", validateToken, updateProfilePic);

export default router;
