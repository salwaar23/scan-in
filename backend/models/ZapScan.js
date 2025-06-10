import { DataTypes } from "sequelize";
import db from "../database/database.js";

const ZapFinding = db.define('zap_finding', {
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
    type: DataTypes.STRING,
    allowNull: false,
  },
  risk: {
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

export default ZapFinding;
