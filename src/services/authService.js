// src/services/authService.js

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwtUtils.js";
import chalk from "chalk";

const prisma = new PrismaClient();

//* POST /auth/register
export async function register(req, res) {
  const { nama, pn, password, role } = req.body;

  try {
    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { pn } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan pengguna ke database dengan role yang disertakan
    const newUser = await prisma.user.create({
      data: {
        nama,
        pn,
        password: hashedPassword,
        role: role || "user", // Menggunakan role yang disertakan, atau default ke 'user' jika tidak disertakan
      },
    });

    // Generate token akses
    const accessToken = generateAccessToken(newUser.id_rm);

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      accessToken,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
}

//* POST /auth/login
export async function login(req, res) {
  const { pn, password } = req.body;

  try {
    // Cari pengguna berdasarkan nomor PN
    const user = await prisma.user.findUnique({ where: { pn } });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid personal number or password" });
    }

    // Verifikasi password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Invalid personal number or password" });
    }

    
    const isAdmin = user.role === process.env.ADMIN_ROLE;

    // Generate token akses dan refresh token
    const accessToken = generateAccessToken(user.id_rm);
    const refreshToken = generateRefreshToken(user.id_rm);

    res.status(200).json({ accessToken, refreshToken, isAdmin });
    console.log(chalk.green("Login successful"));
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Failed to log in" });
  }
}


// * POST /auth/refresh
export async function refreshToken(req, res) {
  const { refreshToken } = req.body;

  try {
    // Verifikasi refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Generate token akses baru
    const accessToken = generateAccessToken(decoded.userId);

    res.status(200).json({ accessToken });
    console.log(chalk.green("Refresh token successful"));
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(403).json({ message: "Invalid refresh token" });
  }
}
