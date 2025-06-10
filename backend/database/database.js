import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); 

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    timezone: process.env.DB_TIMEZONE,
  }
);

const connectWithRetry = async () => {
  let retries = 10;
  while (retries) {
    try {
      await db.authenticate();
      console.log("Database connected ✅");
      break;
    } catch (err) {
      console.log(`Database connection failed. Retrying in 5s... (${retries} left)`);
      retries--;
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};

await connectWithRetry();

export default db;
