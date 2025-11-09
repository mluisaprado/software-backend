import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

export const sequelize = connectionString
  ? new Sequelize(connectionString, {
      dialect: "postgres",
      logging: false,
    })
  : new Sequelize({
      database: process.env.DB_NAME as string,
      username: process.env.DB_USER as string,
      password: process.env.DB_PASS,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      dialect: "postgres",
      logging: false,
    });

export async function connectDB() {
  let retries = 5;
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log("✅ Conectado a PostgreSQL correctamente");
      break;
    } catch (error) {
      retries -= 1;
      console.error(
        `❌ Error al conectar con la base de datos (intentos restantes: ${retries}):`,
        (error as any).message
      );
      if (!retries) throw error;
      await new Promise((res) => setTimeout(res, 5000)); // espera 5s y reintenta
    }
  }
}
