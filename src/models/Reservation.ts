import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import User from "./User";
import { Trip } from "./Trip";

export class Reservation extends Model {}

Reservation.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Trip, key: "id" },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "rejected",
        "canceled",
        "not_attended",
        "completed"
      ),
      defaultValue: "pending",
      allowNull: false,
    },
  },
  { sequelize, tableName: "reservations", timestamps: true }
);

Reservation.belongsTo(Trip, { foreignKey: "trip_id", as: "trip" });
Reservation.belongsTo(User, { foreignKey: "user_id", as: "user" });
Trip.hasMany(Reservation, { foreignKey: "trip_id", as: "reservations" });



