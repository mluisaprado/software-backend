import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import User from "./User";
import { Trip } from "./Trip";

export class Reservation extends Model {}

Reservation.init(
  {
    id: { 
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true 
    },

    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Trip, key: "id" }
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" }
    },

    status: {
      type: DataTypes.ENUM(
        "pending",       // recién creada
        "confirmed",     // conductor acepta
        "rejected",      // conductor rechaza
        "canceled",      // pasajero cancela
        "not_attended",  // pasajero no asistió
        "completed"      // viaje completado
      ),
      defaultValue: "pending",
      allowNull: false,
    },

    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "reservations",
    timestamps: true,
  }
  

);

// 🔗 Relaciones
Reservation.belongsTo(Trip, { foreignKey: "trip_id", as: "trip" });
Reservation.belongsTo(User, { foreignKey: "user_id", as: "user" });

Trip.hasMany(Reservation, { foreignKey: "trip_id", as: "reservations" });
User.hasMany(Reservation, { foreignKey: "user_id", as: "reservations" });

export default Reservation;
