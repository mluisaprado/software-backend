// src/routes/reservationRoutes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  acceptReservation,
  rejectReservation,
  listMyUpcomingTrips,
  listReservationsForTrip,
  rateReservation,        
  listMyPastTrips,
} from "../controllers/reservationController";

const router = Router();

// Reservas → acciones del conductor
router.patch("/:id/accept", authMiddleware, acceptReservation);
router.patch("/:id/reject", authMiddleware, rejectReservation);

// Viajes próximos y pasados del usuario
router.get("/my-upcoming", authMiddleware, listMyUpcomingTrips);
router.get("/my-past", authMiddleware, listMyPastTrips);

// Reservas asociadas a un viaje del conductor
router.get("/trip/:id", authMiddleware, listReservationsForTrip);

// Calificar viaje (pasajero)
router.patch("/:id/rate", authMiddleware, rateReservation);

export default router;
