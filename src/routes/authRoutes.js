// src/routes/authRoutes.js
import express from "express";
import { register, login, refreshToken } from "../services/authService.js";
import { refreshTokenMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Endpoint untuk mendaftar pengguna baru
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshTokenMiddleware, refreshToken);

export default router;
