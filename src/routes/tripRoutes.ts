import { Router } from "express";
import { createTrip, listTrips, reserveTrip } from "../controllers/tripController";
import { authMiddleware } from "../middleware/auth";
import { listReservationsForTrip } from "../controllers/reservationController";

const router = Router();

router.get("/", listTrips);
router.post("/", authMiddleware, createTrip);
router.post("/:id/reservations", authMiddleware, reserveTrip);
router.get("/:id/reservations", authMiddleware, listReservationsForTrip);

export default router;
