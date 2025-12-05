// src/routes/reservationRoutes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  acceptReservation,
  rejectReservation,
} from "../controllers/reservationController";
import { listMyUpcomingTrips } from "../controllers/reservationController";


const router = Router();

// PATCH /api/reservations/:id/accept
router.patch("/:id/accept", authMiddleware, acceptReservation);

// PATCH /api/reservations/:id/reject
router.patch("/:id/reject", authMiddleware, rejectReservation);

router.get("/my-upcoming", authMiddleware, listMyUpcomingTrips);

export default router;
