import express from "express";
import {
  addLike,
  removeLike,
  getLikes,
  getLikeStatus,
} from "../controllers/like.js";
import validateToken from "../middleware/validateTokenHandler.js";

const router = express.Router();

// Add a like
router.post("/", validateToken, addLike);

// Remove a like
router.delete("/:postId", validateToken, removeLike);

// Get likes for a post
router.get("/:postId", getLikes);

// Get like status
router.get("/:postId/status", validateToken, getLikeStatus);

export default router;
