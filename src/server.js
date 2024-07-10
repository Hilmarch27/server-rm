// server.js
import "dotenv/config";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import debitRoutes from "./routes/debitRoutes.js";
import cors from "cors";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/api", debitRoutes);

// Start server
const server = app.listen(PORT, () => {
  console.log(chalk.blue(`Server is running on port ${PORT}`));
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log(chalk.red("SIGINT signal received: closing HTTP server"));
  server.close(async () => {
    console.log(chalk.red("HTTP server closed"));
    await prisma.$disconnect();
    console.log(chalk.red("Prisma client disconnected"));
    process.exit(0);
  });
});

process.on("SIGTERM", async () => {
  console.log(chalk.red("SIGTERM signal received: closing HTTP server"));
  server.close(async () => {
    console.log(chalk.red("HTTP server closed"));
    await prisma.$disconnect();
    console.log(chalk.red("Prisma client disconnected"));
    process.exit(0);
  });
});
