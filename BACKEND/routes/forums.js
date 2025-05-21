import express from "express";
import { createForum, getForums, deleteForum } from "../controllers/forums.js";
import validateToken from "../middleware/validateTokenHandler.js";

const router = express.Router();

// Create a new forum (Admin and Alumni only)
router.post("/", validateToken, createForum);
router.get("/", validateToken, getForums);
router.delete("/:id", validateToken, deleteForum);

export default router;
