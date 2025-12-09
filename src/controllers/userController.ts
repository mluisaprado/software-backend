// src/controllers/userController.ts
import { Request, Response } from "express";
import User from "../models/User";
import { Calification } from "../models/Calification";
import { Trip } from "../models/Trip";

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

export const getUserRatings = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const ratings = await Calification.findAll({
      where: { user_receiver_id: userId },
      include: [
        { model: User, as: "author", attributes: ["id", "name"] },
        {
          model: Trip,
          as: "trip",
          attributes: ["origin", "destination", "departure_time"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const avg =
      ratings.length > 0
        ? ratings.reduce((sum: number, r: any) => sum + r.score, 0) /
          ratings.length
        : 0;

    return res.json({
      success: true,
      data: {
        average: avg,
        total: ratings.length,
        ratings,
      },
    });
  } catch (error) {
    console.error("getUserRatings error:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener calificaciones",
    });
  }
};
