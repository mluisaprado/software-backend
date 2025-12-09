import { Router } from "express";
import { register, login, getProfile, uploadProfilePicture } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";
import { uploadProfilePicture as uploadMiddleware } from "../middleware/upload";

const router = Router();

// Rutas públicas
router.post("/register", register);
router.post("/login", login);

// Rutas protegidas (requieren autenticación)
router.get("/profile", authMiddleware, getProfile);
router.post(
  "/profile-picture",
  authMiddleware,
  uploadMiddleware.single("profile_picture"),
  uploadProfilePicture
);

export default router;

