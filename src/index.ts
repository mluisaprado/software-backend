import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { sequelize } from "./config/database";
import authRoutes from "./routes/authRoutes";
import tripRoutes from "./routes/tripRoutes";
import userRoutes from "./routes/userRoutes";

import reservationRoutes from "./routes/reservationRoutes";
import messageRoutes from "./routes/messageRoutes";


dotenv.config();

const app = express();

const allowedOrigins = [
  "https://santiago-software.netlify.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8081",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
// Servir archivos estáticos (imágenes de perfil)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const PORT = process.env.PORT || 3000;

// Ruta simple para probar
app.get("/", (_req, res) => {
  res.send("Backend funcionando 🚀");
});

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Rutas de viajes
app.use("/api/trips", tripRoutes);

// Rutas de usuarios
app.use("/api/users", userRoutes);

// Rutas de reservas
app.use("/api/reservations", reservationRoutes);

app.use("/api/messages", messageRoutes);


// Conectar a la base de datos y levantar servidor
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a PostgreSQL correctamente");
    
    // Sincronizar modelos con la base de datos
    await sequelize.sync({ alter: true });
    console.log("✅ Modelos sincronizados con la base de datos");
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error);
    process.exit(1);
  }
};

startServer();
