// src/routes/authRoutes.js

import express from "express";
import {
  createMultipleDebiturController,
  createSingleDebiturController,
  downloadLaporanDebiturCsv,
  getDebitursByLoggedInUserController,
  getDebitursByNamaController,
  // updateActController,
  updateKlasifikasiEcController,
  uploadExcel,
} from "../controllers/debiturController.js";
import { createActController, deleteActController, downloadLaporanRMCsv, editActController, getAllAktifitasLelangCounts, getAllAktifitasNonLelangCounts, getDebiturWithActsController, getLelangCountByBranchOffice, getNonLelangCountByBranchOffice } from "../controllers/activityController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import {uploadFields} from "../middlewares/multer.js";
import { downloadAllCsv, getAll } from "../controllers/adminController.js";
import multer from "multer";

const router = express.Router();
// Set up multer storage
const upload = multer({ storage: multer.memoryStorage() });

const fields = [
  { name: "fotoAgunan1", maxCount: 1 },
  { name: "fotoAgunan2", maxCount: 1 },
  { name: "fotoAgunan3", maxCount: 1 },
  { name: "fotoAgunan4", maxCount: 1 },
  { name: "fotoAgunan5", maxCount: 1 },
  { name: "fotoAgunan6", maxCount: 1 },
];

router.get("/debiturs", authenticateUser, getDebitursByLoggedInUserController);
router.get("/debiturs/:nama", authenticateUser, getDebitursByNamaController);
router.post("/create-debiturs", authenticateUser, createMultipleDebiturController);
// Route: Create a single debitur
router.post("/create-debitur", authenticateUser, createSingleDebiturController);

router.put(
  "/klasifikasi-ec/:id",
  authenticateUser,
  updateKlasifikasiEcController
);
router.get("/download-debiturs", authenticateUser,  downloadLaporanDebiturCsv);
router.post(
  "/upload-xlsx",
  authenticateUser,
  upload.single("file"),
  uploadExcel
);

//* ================ ACTIVITY ROUTES ==============
router.post(
  "/create-act",
  authenticateUser,
  uploadFields(fields),
  createActController
); 

router.patch(
  "/edit-act/:actId", // Menggunakan `:actId` untuk menangkap ID dari parameter URL
  authenticateUser,
  uploadFields(fields),
  editActController
);

router.get("/get-act", authenticateUser, getDebiturWithActsController);
router.get("/download-act", authenticateUser, downloadLaporanRMCsv);

router.delete("/delete-act/:id", authenticateUser, deleteActController);


//* ============ ADMIN ROUTES ============
router.get("/get-all", authenticateUser, getAll);
router.get("/get-lelang", getAllAktifitasLelangCounts);
router.get("/get-nonlelang", getAllAktifitasNonLelangCounts);
router.get("/download-csv", downloadAllCsv);
router.get("/branch-office/lelang", getLelangCountByBranchOffice);
router.get("/branch-office/non-lelang", getNonLelangCountByBranchOffice);


export default router;
