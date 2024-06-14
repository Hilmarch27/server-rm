// src/middlewares/authMiddleware.js

import chalk from "chalk";
import { PrismaClient } from "@prisma/client";
import {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwtUtils.js";

const prisma = new PrismaClient();

async function authenticateUser(req, res, next) {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authentication token is required" });
    }

    // Dapatkan token dari header Authorization
    const token = authHeader.split(" ")[1];

    // Verifikasi token akses JWT
    const decodedAccessToken = verifyAccessToken(token);

    // Ambil ID pengguna dari token akses
    const userId = decodedAccessToken.userId;

    // Cari pengguna berdasarkan ID
    const user = await prisma.user.findUnique({ where: { id_rm: userId } });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Tambahkan objek user ke req untuk digunakan di controller
    req.user = user;

    next();
    console.log(chalk.green("Authentication successful"));
  } catch (error) {
    console.error("Error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
}

async function refreshTokenMiddleware(req, res, next) {
  try {
    // Ambil token refresh dari body request
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    // Verifikasi token refresh
    const decodedRefreshToken = verifyRefreshToken(refreshToken);

    // Ambil ID pengguna dari token refresh
    const userId = decodedRefreshToken.userId;

    // Generate token akses baru
    const newAccessToken = generateAccessToken(userId);

    res.status(200).json({ accessToken: newAccessToken });

    console.log(chalk.green("Refresh token successful"));
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(403).json({ message: "Invalid refresh token" });
  }
}

export { authenticateUser, refreshTokenMiddleware };