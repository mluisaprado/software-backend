import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import User from "./User";

export class Trip extends Model {}

Trip.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    origin: { type: DataTypes.STRING, allowNull: false },
    destination: { type: DataTypes.STRING, allowNull: false },
    departure_time: { type: DataTypes.DATE, allowNull: false },
    price_per_seat: { type: DataTypes.INTEGER, allowNull: false },
    total_seats: { type: DataTypes.INTEGER, allowNull: false },
    available_seats: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("published", "full", "canceled", "completed"),
      defaultValue: "published",
      allowNull: false,
    },
  },
  { sequelize, tableName: "trips", timestamps: true }
);

Trip.belongsTo(User, { foreignKey: "user_id", as: "driver" });
User.hasMany(Trip, { foreignKey: "user_id", as: "trips" });
