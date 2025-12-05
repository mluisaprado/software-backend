// src/controllers/messageController.ts
import { Request, Response } from "express";
import { Op } from "sequelize";
import { Message } from "../models/Message";
import { Trip } from "../models/Trip";
import User from "../models/User";

/**
 * GET /api/messages/:tripId/:otherUserId
 * Lista los mensajes entre el usuario autenticado y otro usuario para un viaje.
 */
export const listMessagesForTripAndUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    const tripId = Number(req.params.tripId);
    const otherUserId = Number(req.params.otherUserId);

    if (!currentUserId) {
      res.status(401).json({ success: false, message: "No autorizado" });
      return;
    }

    if (Number.isNaN(tripId) || Number.isNaN(otherUserId)) {
      res.status(400).json({
        success: false,
        message: "Parámetros de ruta inválidos",
      });
      return;
    }

    // Verificamos que el viaje exista
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      res.status(404).json({
        success: false,
        message: "Viaje no encontrado",
      });
      return;
    }

    const messages = await Message.findAll({
      where: {
        trip_id: tripId,
        [Op.or]: [
          {
            user_sender_id: currentUserId,
            user_receiver_id: otherUserId,
          },
          {
            user_sender_id: otherUserId,
            user_receiver_id: currentUserId,
          },
        ],
      },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    console.error("Error al listar mensajes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener mensajes",
      error: error.message,
    });
  }
};

/**
 * POST /api/messages
 * Enviar un mensaje en un viaje a otro usuario.
 */
export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    const { tripId, receiverId, content } = req.body as {
      tripId?: number;
      receiverId?: number;
      content?: string;
    };

    if (!currentUserId) {
      res.status(401).json({ success: false, message: "No autorizado" });
      return;
    }

    if (!tripId || !receiverId || !content?.trim()) {
      res.status(400).json({
        success: false,
        message: "tripId, receiverId y content son requeridos",
      });
      return;
    }

    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      res.status(404).json({
        success: false,
        message: "Viaje no encontrado",
      });
      return;
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      res.status(404).json({
        success: false,
        message: "Usuario receptor no encontrado",
      });
      return;
    }

    const message = await Message.create({
      trip_id: tripId,
      user_sender_id: currentUserId,
      user_receiver_id: receiverId,
      content: content.trim(),
      read: false,
    });

    res.status(201).json({
      success: true,
      message: "Mensaje enviado",
      data: message,
    });
  } catch (error: any) {
    console.error("Error al enviar mensaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar mensaje",
      error: error.message,
    });
  }
};
