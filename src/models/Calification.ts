// models/Calificacion.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import User from "./User";
import { Trip } from "./Trip";

export class Calification extends Model {}

Calification.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Trip, key: "id" },
    },
    user_author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    user_receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: { type: DataTypes.TEXT },
  },
  { sequelize, tableName: "califications", timestamps: true }
);

Calification.belongsTo(Trip, { foreignKey: "trip_id", as: "trip" });
Calification.belongsTo(User, { foreignKey: "user_author_id", as: "author" });
Calification.belongsTo(User, { foreignKey: "user_receiver_id", as: "receiver" });
