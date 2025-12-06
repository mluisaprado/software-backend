// src/controllers/reservationController.ts
import { Request, Response } from "express";
import { Op } from "sequelize";

import { Reservation } from "../models/Reservation";
import { Trip } from "../models/Trip";
import { Calification } from "../models/Calification";
import User from "../models/User";

/**
 * GET /api/trips/:id/reservations
 * Lista las reservas de un viaje específico (del conductor autenticado)
 */
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
      include: [{ model: Trip, as: "trip" }],
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
      include: [{ model: Trip, as: "trip" }],
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

/**
 * GET /api/reservations/my-upcoming
 * Lista próximos viajes donde:
 * - eres pasajera (reservas confirmadas)
 * - o eres conductora (viajes donde tú eres driver y tienen reservas confirmadas)
 */
export const listMyUpcomingTrips = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "No autorizado" });
      return;
    }

    const now = new Date();

    // 1) Como PASAJERA (reservas confirmadas)
    const asPassengerReservations = await Reservation.findAll({
      where: {
        user_id: userId,
        status: "confirmed",
      },
      include: [
        {
          model: Trip,
          as: "trip",
          where: {
            departure_time: {
              [Op.gte]: now,
            },
          },
          include: [
            {
              association: Trip.associations.driver,
              attributes: { exclude: ["password"] },
            },
          ],
        },
      ],
      order: [[{ model: Trip, as: "trip" }, "departure_time", "ASC"]],
    });

    // 2) Como CONDUCTORA (viajes donde tú eres driver)
    const asDriverReservations = await Reservation.findAll({
      where: {
        status: "confirmed",
      },
      include: [
        {
          model: Trip,
          as: "trip",
          where: {
            user_id: userId, // tú eres la conductora
            departure_time: {
              [Op.gte]: now,
            },
          },
          include: [
            {
              association: Trip.associations.driver,
              attributes: { exclude: ["password"] },
            },
          ],
        },
      ],
      order: [[{ model: Trip, as: "trip" }, "departure_time", "ASC"]],
    });

    // 3) Normalizamos a un formato común

    const asPassenger = (asPassengerReservations as any[]).map((r) => ({
      id: r.id, // id de la reserva
      role: "passenger" as const,
      status: r.status,
      trip: r.trip,
    }));

    // Para conductor podemos tener varias reservas del mismo viaje
    // -> deduplicamos por trip.id
    const driverTripMap = new Map<number, any>();

    (asDriverReservations as any[]).forEach((r) => {
      const t = r.trip;
      if (t && !driverTripMap.has(t.id)) {
        driverTripMap.set(t.id, {
          id: t.id, // usamos id del viaje
          role: "driver" as const,
          status: t.status,
          trip: t,
        });
      }
    });

    const asDriver = Array.from(driverTripMap.values());

    // 4) Unimos y ordenamos por fecha del viaje
    const all = [...asPassenger, ...asDriver].sort(
      (a, b) =>
        new Date(a.trip.departure_time).getTime() -
        new Date(b.trip.departure_time).getTime()
    );

    res.status(200).json({
      success: true,
      data: all,
    });
  } catch (error: any) {
    console.error("Error al listar próximos viajes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener próximos viajes",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/reservations/:id/rate
 * Calificar un viaje (solo pasajero, una vez, y solo después del viaje)
 */
export const rateReservation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const reservationId = Number(req.params.id);
    const { rating, comment } = req.body;

    // 1. Validar usuario autenticado
    if (!userId) {
      res.status(401).json({ success: false, message: "No autorizado" });
      return;
    }

    // 2. ID válido
    if (Number.isNaN(reservationId)) {
      res.status(400).json({
        success: false,
        message: "ID de reserva inválido",
      });
      return;
    }

    // 3. rating válido
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: "La calificación debe estar entre 1 y 5",
      });
      return;
    }

    // 4. Buscar reserva + viaje
    const reservationRecord = await Reservation.findByPk(reservationId, {
      include: [{ model: Trip, as: "trip" }],
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
        message: "La reserva no tiene viaje asociado",
      });
      return;
    }

    const trip = reservation.trip as any;

    // 5. Solo el pasajero puede calificar
    if (reservation.user_id !== userId) {
      res.status(403).json({
        success: false,
        message: "No tienes permiso para calificar este viaje",
      });
      return;
    }

    // 6. No puedes calificar antes del viaje
    const now = new Date();
    if (trip.departure_time > now) {
      res.status(400).json({
        success: false,
        message: "Solo puedes calificar viajes que ya ocurrieron",
      });
      return;
    }

    // 7. Evitar doble calificación
    //  👉 con tu modelo: una calificación por (trip_id, user_author_id)
    const existing = await Calification.findOne({
      where: {
        trip_id: trip.id,
        user_author_id: reservation.user_id,
      },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: "Ya calificaste este viaje",
      });
      return;
    }

    // 8. Crear calificación usando TU modelo:
    //    - trip_id           → viaje
    //    - user_author_id    → pasajero que califica
    //    - user_receiver_id  → conductor que recibe la calificación
    //    - score             → rating (1–5)
    await Calification.create({
      trip_id: trip.id,
      user_author_id: reservation.user_id, // pasajero
      user_receiver_id: trip.user_id,      // conductor
      score: rating,
      comment,
    });

    res.status(200).json({
      success: true,
      message: "Calificación registrada correctamente",
    });
  } catch (error: any) {
    console.error("Error al calificar viaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al calificar el viaje",
      error: error.message,
    });
  }
};