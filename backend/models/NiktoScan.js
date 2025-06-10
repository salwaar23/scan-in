import { DataTypes } from "sequelize";
import db from "../database/database.js";

const NiktoFinding = db.define('nikto_finding', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  scan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  alert: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  recommendation_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'recommendation',
      key: 'id',
    },
    allowNull: true,
  },
  risk: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  solution: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  freezeTableName: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});

export default NiktoFinding;
