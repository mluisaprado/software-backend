import { Request, Response } from "express";
import { Op, WhereOptions } from "sequelize";
import { Trip } from "../models/Trip";
import Reservation from "../models/Reservation";

interface CreateTripBody {
  origin: string;
  destination: string;
  departure_time: string;
  price_per_seat: number;
  total_seats: number;
  available_seats?: number;
  status?: "published" | "full" | "canceled" | "completed";
}

export const createTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "No autorizado",
      });
      return;
    }

    const {
      origin,
      destination,
      departure_time,
      price_per_seat,
      total_seats,
      available_seats,
      status,
    } = req.body as CreateTripBody;

    if (!origin || !destination || !departure_time || !price_per_seat || !total_seats) {
      res.status(400).json({
        success: false,
        message: "origin, destination, departure_time, price_per_seat y total_seats son requeridos",
      });
      return;
    }
    const isValidLocation = (str: string) => {
      if (!str) return false;
      const trimmed = str.trim();
      if (trimmed.length < 5) return false;         // mínimo 5 caracteres
      if (/^[0-9]/.test(trimmed)) return false;     // no puede comenzar con número
      return true;
    };

    if (!isValidLocation(origin)) {
      res.status(400).json({
        success: false,
        message:
          "El origen debe tener al menos 5 caracteres y no puede comenzar con un número.",
      });
      return;
    }

    if (!isValidLocation(destination)) {
      res.status(400).json({
        success: false,
        message:
          "El destino debe tener al menos 5 caracteres y no puede comenzar con un número.",
      });
      return;
    }

    if (!isValidLocation(origin)) {
      res.status(400).json({
        success: false,
        message:
          "El origen debe tener al menos 5 caracteres y no puede comenzar con un número.",
      });
      return;
    }

    if (total_seats <= 0) {
      res.status(400).json({
        success: false,
        message: "total_seats debe ser mayor a cero",
      });
      return;
    }

    if (price_per_seat <= 0 || !Number.isInteger(price_per_seat)) {
      res.status(400).json({
        success: false,
        message: "price_per_seat debe ser un número entero mayor a cero",
      });
      return;
    }

    const seatsAvailable = available_seats ?? total_seats;

    if (seatsAvailable < 0 || seatsAvailable > total_seats) {
      res.status(400).json({
        success: false,
        message: "available_seats debe estar entre 0 y total_seats",
      });
      return;
    }

    const parsedDeparture = new Date(departure_time);
    if (Number.isNaN(parsedDeparture.getTime())) {
      res.status(400).json({
        success: false,
        message: "departure_time debe ser una fecha válida",
      });
      return;
    }

    const now = new Date();
    if (parsedDeparture <= now) {
      res.status(400).json({
        success: false,
        message: "La fecha del viaje debe ser posterior a la fecha y hora actual.",
      });
      return;
    }

    const trip = await Trip.create({
      user_id: userId,
      origin,
      destination,
      departure_time: parsedDeparture,
      price_per_seat,
      total_seats,
      available_seats: seatsAvailable,
      status: status ?? "published",
    });
    res.status(201).json({
      success: true,
      message: "Viaje publicado exitosamente",
      data: trip,
    });
  } catch (error: any) {
    console.error("Error al crear viaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al publicar viaje",
      error: error.message,
    });
  }
};

export const listTrips = async (req: Request, res: Response): Promise<void> => {
  try {
    const { origin, destination, date, status } = req.query as {
      origin?: string;
      destination?: string;
      date?: string;
      status?: string;
    };

    const where: WhereOptions = {};

    if (origin) {
      where.origin = { [Op.iLike]: `%${origin}%` };
    }

    if (destination) {
      where.destination = { [Op.iLike]: `%${destination}%` };
    }

    if (status) {
      where.status = status;
    } else {
      where.status = "published";
    }

    // 🔥 FILTRO DE FECHA CORREGIDO
    if (date) {
      // date viene como "YYYY-MM-DD"
      const [y, m, d] = date.split("-").map(Number);

      if (!y || !m || !d) {
        res.status(400).json({
          success: false,
          message: "date debe ser una fecha válida (YYYY-MM-DD)",
        });
        return;
      }

      const startOfDay = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));

      where.departure_time = {
        [Op.between]: [startOfDay, endOfDay],
      };
    }

    const trips = await Trip.findAll({
      where,
      order: [["departure_time", "ASC"]],
      include: [
        {
          association: Trip.associations.driver,
          attributes: { exclude: ["password"] },
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: trips,
    });
  } catch (error: any) {
    console.error("Error al listar viajes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener viajes",
      error: error.message,
    });
  }
};

// Listar viajes creados por el usuario autenticado (conductor)
export const listMyTrips = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "No autorizado",
      });
      return;
    }

    const { status } = req.query as { status?: string };

    const where: WhereOptions = { user_id: userId };

    if (status && status !== "all" && status.trim() !== "") {
      where.status = status;
    }

    const trips = await Trip.findAll({
      where,
      order: [["departure_time", "DESC"]],
      include: [
        {
          association: Trip.associations.driver,
          attributes: { exclude: ["password"] },
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: trips,
    });
  } catch (error: any) {
    console.error("Error al listar mis viajes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener tus viajes",
      error: error.message,
    });
  }
};

export const reserveTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const tripId = req.params.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "No autorizado",
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

    // @ts-ignore
    if (trip.user_id === userId) {
      res.status(400).json({
        success: false,
        message: "No puedes reservar tu propio viaje",
      });
      return;
    }

    // @ts-ignore
    if (trip.available_seats <= 0) {
      res.status(400).json({
        success: false,
        message: "No hay asientos disponibles",
      });
      return;
    }

    const existingReservation = await Reservation.findOne({
      where: {
        trip_id: tripId,
        user_id: userId,
      },
    });

    if (existingReservation) {
      res.status(400).json({
        success: false,
        message: "Ya reservaste este viaje",
      });
      return;
    }

    const reservation = await Reservation.create({
      trip_id: tripId,
      user_id: userId,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Reserva creada correctamente",
      data: reservation,
    });
  } catch (error: any) {
    console.error("Error al reservar viaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al reservar el viaje",
      error: error.message,
    });
  }
};
