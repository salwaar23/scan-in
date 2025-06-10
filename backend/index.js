import express from "express";
import cors from "cors";
import scanRoutes from "./routes/scanRoute.js";
import db from "./database/database.js";
import seedRecommendations from "./seed/seedRecommendation.js";

const app = express();

(async() => {
  await db.sync();
  await seedRecommendations();
})();

app.use(cors());

app.use(express.json());

app.use(scanRoutes)


// Menjalankan server
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});