import express from "express";
import {
  createForum,
  getForums,
  deleteForum,
  getForumById,
} from "../controllers/forums.js";
import {
  getCommentsForForum,
  createCommentForForum,
} from "../controllers/forumComment.js";

import { validateToken } from "../middleware/validateTokenHandler.js";

const router = express.Router();

// Forum routes
router.post("/", validateToken, createForum);
router.get("/", validateToken, getForums);
router.delete("/:id", validateToken, deleteForum);
router.get("/:id", getForumById); // Public
router.get("/:id/comments", getCommentsForForum); // Public

// ✅ Allow posting comments WITHOUT token
router.post("/:id/comments", createCommentForForum);

export default router;
