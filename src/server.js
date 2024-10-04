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
const corsOptions = {
  origin: ["http://localhost:5173", /^(http:\/\/)?localhost(:\d{1,5})?$/],
  methods: ["GET", "HEAD", "OPTIONS", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "X-Access-Token",
    "Authorization",
  ],
  credentials: true,
  preflightContinue: true, // Allow the OPTIONS response to continue to the actual request
};
// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options("*", cors(corsOptions));


// app.use(express.json());

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

