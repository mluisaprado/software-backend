// src/routes/messageRoutes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  listMessagesForTripAndUser,
  sendMessage,
} from "../controllers/messageController";

const router = Router();

// GET /api/messages/:tripId/:otherUserId
router.get("/:tripId/:otherUserId", authMiddleware, listMessagesForTripAndUser);

// POST /api/messages
router.post("/", authMiddleware, sendMessage);

export default router;
