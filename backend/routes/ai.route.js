import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import multer from "multer";
import { checkAtsScore, generateJobDescription } from "../controllers/ai.controller.js";

const router = express.Router();

// Memory storage for parsing PDF in memory without saving to disk
const upload = multer({ storage: multer.memoryStorage() });

router.route("/check-ats").post(isAuthenticated, upload.single("resume"), checkAtsScore);
router.route("/generate-jd").post(isAuthenticated, generateJobDescription);

export default router;