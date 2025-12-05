import { Router } from "express";
import { createTrip, listTrips, reserveTrip } from "../controllers/tripController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", listTrips);
router.post("/", authMiddleware, createTrip);
router.post("/:id/reservations", authMiddleware, reserveTrip);

export default router;
