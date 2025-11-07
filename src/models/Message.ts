import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import User from "./User";
import { Trip } from "./Trip";

export class Message extends Model {}

Message.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Trip, key: "id" },
    },
    user_sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    user_receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    content: { type: DataTypes.TEXT, allowNull: false },
    read: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, tableName: "messages", timestamps: true }
);

Message.belongsTo(Trip, { foreignKey: "trip_id", as: "trip" });
Message.belongsTo(User, { foreignKey: "user_sender_id", as: "sender" });
Message.belongsTo(User, { foreignKey: "user_receiver_id", as: "receiver" });
