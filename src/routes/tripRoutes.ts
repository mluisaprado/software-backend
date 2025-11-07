import { Router } from "express";
import { createTrip, listTrips } from "../controllers/tripController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", listTrips);
router.post("/", authMiddleware, createTrip);

export default router;
