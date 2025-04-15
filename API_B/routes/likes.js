import express from "express";
import { likePost } from "../controllers/like.js";
import validateToken from "../middleware/validateTokenHandler.js";

const router = express.Router();

router.put("/", validateToken, likePost);

export default router;
