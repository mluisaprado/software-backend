import { Request, Response } from "express";
import { Op, WhereOptions } from "sequelize";
import { Trip } from "../models/Trip";

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

    if (total_seats <= 0) {
      res.status(400).json({
        success: false,
        message: "total_seats debe ser mayor a cero",
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

    if (date) {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        res.status(400).json({
          success: false,
          message: "date debe ser una fecha válida (YYYY-MM-DD)",
        });
        return;
      }

      const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));

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
