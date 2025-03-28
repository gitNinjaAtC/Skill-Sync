import express from "express";
import {
  getPosts,
  addPost,
  reviewPost,
  deletePost,
} from "../controllers/post.js";
import validateToken from "../middleware/validateTokenHandler.js";

const router = express.Router();

router.get("/", getPosts);
router.post("/", validateToken, addPost);
router.put("/review", validateToken, reviewPost); // Admin reviews posts
router.delete("/:id", deletePost);

export default router;
