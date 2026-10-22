import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { updateProfile } from "../controllers/profileController.js";

const router = express.Router();

router.put("/update-profile", protect, updateProfile);

export default router;
