// import express from "express";
// import { addComment, getComments } from "../controllers/comment.js";
// import validateToken from "../middleware/validateTokenHandler.js";

// const router = express.Router();

// // Get comments for a post
// router.get("/:postId", validateToken, getComments);

// // Add a new comment
// router.post("/", validateToken, addComment);

// export default router;
import express from "express";
import { addComment, getComments } from "../controllers/comment.js";
import validateToken from "../middleware/validateTokenHandler.js";

const router = express.Router();

// Get comments for a post
router.get("/:postId", validateToken, getComments);

// Add a new comment
router.post("/", validateToken, addComment);

export default router;
