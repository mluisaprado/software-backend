import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./config/database";
import authRoutes from "./routes/authRoutes";
import tripRoutes from "./routes/tripRoutes";

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://santiago-software.netlify.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Ruta simple para probar
app.get("/", (_req, res) => {
  res.send("Backend funcionando 🚀");
});

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Rutas de viajes
app.use("/api/trips", tripRoutes);

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
