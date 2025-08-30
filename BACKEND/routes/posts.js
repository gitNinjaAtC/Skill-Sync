import express from "express";
import {
  getPosts,
  addPost,
  reviewPost,
  deletePost,
  getPendingPosts,
} from "../controllers/post.js";
import { validateToken } from "../middleware/validateTokenHandler.js";

const router = express.Router();

// ✅ Place before dynamic route
router.get("/pending-posts", validateToken, getPendingPosts);

router.get("/", getPosts);
router.post("/", validateToken, addPost);
router.post("/review", validateToken, reviewPost);
router.delete("/:postId", validateToken, deletePost);

export default router;
