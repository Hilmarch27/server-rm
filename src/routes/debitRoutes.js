// src/routes/authRoutes.js

import express from "express";
import {
  getDebitursByLoggedInUser,
  getDebitursByNama,
  addMultipleDebitur,
} from "../controllers/debitursController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import {
  addPemberkasan,
  addPenagihan,
  getActivity,
  updatePenagihan,
  updatePemberkasan,
} from "../controllers/activityController.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Navigasi satu tingkat di atas dan menuju ke direktori uploads
const uploadDir = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.get("/debiturs", authenticateUser, getDebitursByLoggedInUser);
router.get("/debiturs/:nama", getDebitursByNama);
router.post("/multiple-debiturs", addMultipleDebitur);
router.post("/add-penagihan", authenticateUser, addPenagihan);
router.post(
  "/add-pemberkasan",
  authenticateUser,
  upload.fields([
    { name: "foto_depan", maxCount: 1 },
    { name: "foto_kiri", maxCount: 1 },
    { name: "foto_kanan", maxCount: 1 },
    { name: "foto_dalam_rumah1", maxCount: 1 },
    { name: "foto_dalam_rumah2", maxCount: 1 },
    { name: "foto_dalam_rumah3", maxCount: 1 },
  ]),
  addPemberkasan
);

// Route untuk update data
router.put("/update-penagihan/:id", authenticateUser, updatePenagihan);
router.put(
  "/update-pemberkasan/:id",
  authenticateUser,
  upload.fields([
    { name: "foto_depan", maxCount: 1 },
    { name: "foto_kiri", maxCount: 1 },
    { name: "foto_kanan", maxCount: 1 },
    { name: "foto_dalam_rumah1", maxCount: 1 },
    { name: "foto_dalam_rumah2", maxCount: 1 },
    { name: "foto_dalam_rumah3", maxCount: 1 },
  ]),
  updatePemberkasan
);

router.get("/activity/:nama", getActivity);

export default router;
