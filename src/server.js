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
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend's local URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true // Allow cookies and credentials
}));


app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Explicitly allow preflight requests

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

