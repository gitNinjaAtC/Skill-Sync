// C:\Users\Dell\Desktop\SkillSync\Skill-Sync\BACKEND\routes\users.js

import express from "express";
import { getUser, getAllUsers } from "../controllers/user.js";

const router = express.Router();

router.get("/find/:userId", getUser); // optional
router.get("/users", getAllUsers); // ✅ this is what frontend calls

export default router;
