import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Ruta simple para probar
app.get("/", (_req, res) => {
  res.send("Backend funcionando 🚀");
});

// Conectar a la base de datos y levantar servidor
connectDB();

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
