import express from "express";
import {
  getAllContacts,
  getChats,
  getMessagesById,
  sendMessage,
} from "../controllers/messagesController.js";
import { protect } from "../middleware/authMiddleware.js";
import { arcjetProtect } from "../middleware/arcjetMiddleware.js";

const router = express.Router();

router.use(arcjetProtect, protect);

router.get("/contact", getAllContacts);
router.get("/chats", getChats);
router.get("/:id", getMessagesById);

router.post("/send/:id", sendMessage);

export default router;
