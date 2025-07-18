import express from "express";
import { validateToken } from "../middleware/validateTokenHandler.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", getUsersForSidebar);
router.get("/:id", getMessages);
router.post("/send/:id", sendMessage);

export default router;
