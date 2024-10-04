// server.js
import "dotenv/config";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import debitRoutes from "./routes/debitRoutes.js";
import cors from "cors";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./utils/logger.js";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Middleware
// Enable CORS for your frontend URL and handle preflight requests
const allowedOrigins = [
  "http://localhost:5173", // Development URL
  "https://client-rm.vercel.app", // Production URL
];

// Enable CORS for your frontend URL and handle preflight requests
app.use(
  cors({
    origin: allowedOrigins, // Allow both origins
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow credentials if needed
  })
);

// Handle preflight requests for all routes
app.options("*", cors());

// Routes
app.use("/auth", authRoutes);
app.use("/api", debitRoutes);


app.get('/health', (req, res) => {
  res.send('Alhamdulillah');
});


// Start server
const server = app.listen(PORT, () => {
  logger.info(chalk.blue(`Server is running on port ${PORT}`));
});

