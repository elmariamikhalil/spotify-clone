import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

//app.use(cors({
//  origin: ['https://kael.es', 'https://www.kael.es', 'http://localhost:5173'],
//  credentials: true,
//  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//  allowedHeaders: ['Content-Type', 'Authorization'],
//}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use("/api", routes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ message: "Spotify Clone API", version: "1.0.0" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available in http://localhost:${PORT}/api`);
  console.log(`❤️  Health check at http://localhost:${PORT}/health`);
});
