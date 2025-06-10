import { DataTypes } from "sequelize";
import db from "../database/database.js";

const Scan = db.define('scan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tools: {
    type: DataTypes.ENUM('zap', 'nikto', 'both'),
    allowNull: false,
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  finished_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'running', 'completed', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
  }
}, {
  freezeTableName: true,
  timestamps: true,         
  createdAt: 'created_at',  
  updatedAt: 'updated_at',  
  underscored: true,        
});

export default Scan;
