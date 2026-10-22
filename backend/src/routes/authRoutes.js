import express from "express";
import { login, logout, register } from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", authLimiter, register);

router.post("/login", authLimiter, login);
router.post("/logout", logout);

router.get("/check", protect, (req, res) => {
  res.status(200).json({ user: req.user });
});

export default router;
