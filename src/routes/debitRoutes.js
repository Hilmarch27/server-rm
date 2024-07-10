// src/routes/authRoutes.js

import express from "express";
import { addMultipleDebiturController, createActController, getActByDebiturIdController, getDebitursByLoggedInUserController, getDebitursByNamaController, updateDebitur } from "../controllers/debiturController.js";
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
router.get("/debiturs/:nama", getDebitursByNamaController);
router.post("/multiple-debiturs", addMultipleDebiturController);
router.put("/update-debitur/:id", updateDebitur);

// activity
router.post(
  "/add-act",
  authenticateUser,
  uploadFields(fields),
  createActController
);
router.get("/get-act", getActByDebiturIdController);

export default router;
