// src/controllers/userController.ts
import { Request, Response } from "express";
import User from "../models/User"; // igual que en authController

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // No mandamos el password
    const { password, ...safeUser } = user.toJSON();

    return res.json(safeUser);
  } catch (error) {
    console.error("Error al obtener usuario por ID:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
    