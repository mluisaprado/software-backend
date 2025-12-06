import { Router } from "express";
import { getUserById } from "../controllers/userController";

const router = Router();

// GET /users/:id → visitar perfil
router.get("/:id", getUserById);
// Si quieres probar sin login, descomenta esto y comenta la línea de arriba:
// router.get("/:id", getUserById);

export default router;
