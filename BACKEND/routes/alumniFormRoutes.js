import express from "express";
import { getAlumniForm, submitAlumniForm } from "../controllers/alumniForm.js";
import { validateToken } from "../middleware/validateTokenHandler.js"; // ✅ import middleware

const router = express.Router();

router.get("/alumni/form", validateToken, getAlumniForm);   // ✅ only authenticated alumni
router.post("/alumni/form", validateToken, submitAlumniForm); // ✅ only authenticated alumni

export default router;
