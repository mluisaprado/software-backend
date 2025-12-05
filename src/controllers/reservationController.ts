// src/controllers/reservationController.ts
import { Request, Response } from "express";
import { Reservation } from "../models/Reservation";
import { Trip } from "../models/Trip";
import User from "../models/User";

export const listReservationsForTrip = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const driverId = req.user?.id;
    const tripId = Number(req.params.id);

    if (!driverId) {
      res.status(401).json({ success: false, message: "No autorizado" });
      return;
    }

    if (Number.isNaN(tripId)) {
      res.status(400).json({
        success: false,
        message: "El id de viaje no es válido",
      });
      return;
    }

    const tripRecord = await Trip.findByPk(tripId);

    if (!tripRecord) {
      res.status(404).json({
        success: false,
        message: "Viaje no encontrado",
      });
      return;
    }

    // 👉 hacemos cast a any para poder usar user_id sin que TS se queje
    const trip = tripRecord as any;

    if (trip.user_id !== driverId) {
      res.status(403).json({
        success: false,
        message: "No tienes permisos para ver las reservas de este viaje",
      });
      return;
    }

    const reservations = await Reservation.findAll({
      where: { trip_id: tripId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: reservations,
    });
  } catch (error: any) {
    console.error("Error al listar reservas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener reservas",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/reservations/:id/accept
 * Aceptar una reserva (solo conductor dueño del viaje)
 */
export const acceptReservation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const driverId = req.user?.id;
    const reservationId = Number(req.params.id);

    if (!driverId) {
      res.status(401).json({ success: false, message: "No autorizado" });
      return;
    }

    if (Number.isNaN(reservationId)) {
      res.status(400).json({
        success: false,
        message: "El id de la reserva no es válido",
      });
      return;
    }

    const reservationRecord = await Reservation.findByPk(reservationId, {
      include: [
        {
          model: Trip,
          as: "trip",
        },
      ],
    });

    if (!reservationRecord) {
      res.status(404).json({
        success: false,
        message: "Reserva no encontrada",
      });
      return;
    }

    // 👉 casteamos para poder usar .status y .trip
    const reservation = reservationRecord as any;

    if (!reservation.trip) {
      res.status(404).json({
        success: false,
        message: "Reserva no tiene viaje asociado",
      });
      return;
    }

    const trip = reservation.trip as any;

    if (trip.user_id !== driverId) {
      res.status(403).json({
        success: false,
        message: "No tienes permisos para gestionar esta reserva",
      });
      return;
    }

    if (reservation.status !== "pending") {
      res.status(400).json({
        success: false,
        message: "La reserva ya fue gestionada",
      });
      return;
    }

    // No aceptar reservas de viajes pasados
    const now = new Date();
    if (trip.departure_time <= now) {
      res.status(400).json({
        success: false,
        message: "No se pueden aceptar reservas de un viaje que ya ocurrió",
      });
      return;
    }

    if (trip.available_seats <= 0) {
      res.status(400).json({
        success: false,
        message: "No hay asientos disponibles para este viaje",
      });
      return;
    }

    // Actualizar reserva
    reservation.status = "confirmed";
    await reservation.save();

    // Actualizar asientos y estado del viaje
    trip.available_seats -= 1;
    if (trip.available_seats === 0) {
      trip.status = "full";
    }
    await trip.save();

    res.status(200).json({
      success: true,
      message: "Reserva aceptada correctamente",
    });
  } catch (error: any) {
    console.error("Error al aceptar reserva:", error);
    res.status(500).json({
      success: false,
      message: "Error al aceptar la reserva",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/reservations/:id/reject
 * Rechazar una reserva (solo conductor dueño del viaje)
 */
export const rejectReservation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const driverId = req.user?.id;
    const reservationId = Number(req.params.id);

    if (!driverId) {
      res.status(401).json({ success: false, message: "No autorizado" });
      return;
    }

    if (Number.isNaN(reservationId)) {
      res.status(400).json({
        success: false,
        message: "El id de la reserva no es válido",
      });
      return;
    }

    const reservationRecord = await Reservation.findByPk(reservationId, {
      include: [
        {
          model: Trip,
          as: "trip",
        },
      ],
    });

    if (!reservationRecord) {
      res.status(404).json({
        success: false,
        message: "Reserva no encontrada",
      });
      return;
    }

    const reservation = reservationRecord as any;

    if (!reservation.trip) {
      res.status(404).json({
        success: false,
        message: "Reserva no tiene viaje asociado",
      });
      return;
    }

    const trip = reservation.trip as any;

    if (trip.user_id !== driverId) {
      res.status(403).json({
        success: false,
        message: "No tienes permisos para gestionar esta reserva",
      });
      return;
    }

    if (reservation.status !== "pending") {
      res.status(400).json({
        success: false,
        message: "La reserva ya fue gestionada",
      });
      return;
    }

    // Rechazar
    reservation.status = "rejected";
    await reservation.save();

    res.status(200).json({
      success: true,
      message: "Reserva rechazada correctamente",
    });
  } catch (error: any) {
    console.error("Error al rechazar reserva:", error);
    res.status(500).json({
      success: false,
      message: "Error al rechazar la reserva",
      error: error.message,
    });
  }
};
