import dotenv from "dotenv";
import { sequelize } from "../config/database";
import User from "../models/User";
import { Trip } from "../models/Trip";
import { Reservation } from "../models/Reservation";
import { Calification } from "../models/Calification";
import { Message } from "../models/Message";

dotenv.config();

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a la base de datos establecida");

    await sequelize.sync();
    console.log("✅ Modelos sincronizados");

    const [driver] = await User.findOrCreate({
      where: { email: "driver@example.com" },
      defaults: {
        name: "Driver One",
        email: "driver@example.com",
        password: "password123",
      },
    });

    const [passenger] = await User.findOrCreate({
      where: { email: "passenger@example.com" },
      defaults: {
        name: "Passenger One",
        email: "passenger@example.com",
        password: "password123",
      },
    });

    const [trip] = await Trip.findOrCreate({
      where: {
        user_id: driver.get("id") as number,
        origin: "Lima",
        destination: "Cusco",
      },
      defaults: {
        user_id: driver.get("id") as number,
        origin: "Lima",
        destination: "Cusco",
        departure_time: new Date(Date.now() + 1000 * 60 * 60 * 24),
        price_per_seat: 35,
        total_seats: 4,
        available_seats: 3,
        status: "published",
      },
    });

    await Reservation.findOrCreate({
      where: {
        trip_id: trip.get("id") as number,
        user_id: passenger.get("id") as number,
      },
      defaults: {
        status: "confirmed",
      },
    });

    await Calification.findOrCreate({
      where: {
        trip_id: trip.get("id") as number,
        user_author_id: passenger.get("id") as number,
        user_receiver_id: driver.get("id") as number,
      },
      defaults: {
        score: 5,
        comment: "Great ride!",
      },
    });

    await Message.findOrCreate({
      where: {
        trip_id: trip.get("id") as number,
        user_sender_id: passenger.get("id") as number,
        user_receiver_id: driver.get("id") as number,
      },
      defaults: {
        content: "Thanks for accepting my reservation!",
      },
    });

    console.log("🌱 Seeders ejecutados correctamente");
  } catch (error) {
    console.error("❌ Error al ejecutar seeders:", error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

seed();
