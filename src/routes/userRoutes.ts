import { Router } from "express";
import { getUserById, getUserRatings } from "../controllers/userController";

const router = Router();

router.get("/:id", getUserById);
router.get("/:id/ratings", getUserRatings);

export default router;
