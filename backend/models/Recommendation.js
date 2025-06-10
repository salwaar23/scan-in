import { DataTypes } from "sequelize";
import db from "../database/database.js";

const Recommendation = db.define('recommendation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  alert_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pattern_match: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  risk: {
    type: DataTypes.ENUM('Informational', 'Rendah', 'Sedang', 'Tinggi'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  solution: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  freezeTableName: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});

export default Recommendation;
