// src/routes/authRoutes.js

import express from "express";
import {
  createMultipleDebiturController,
  deleteActController,
  getActByDebiturIdController,
  getDebitursByLoggedInUserController,
  getDebitursByNamaController,
  updateActController,
  updateKlasifikasiEcController,
} from "../controllers/debiturController.js";
import { createActController, getDebiturWithActsController } from "../controllers/activityController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import {uploadFields} from "../middlewares/multer.js";

const router = express.Router();

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
router.put(
  "/klasifikasi-ec/:id",
  authenticateUser,
  updateKlasifikasiEcController
);

// activity
router.post(
  "/create-act",
  authenticateUser,
  uploadFields(fields),
  createActController
); 

router.get("/get-act", authenticateUser, getDebiturWithActsController);



router.put(
  "/update-act/:id",
  authenticateUser,
  uploadFields(fields),
  updateActController
);

router.delete("/delete-act/:actId", deleteActController);



export default router;
