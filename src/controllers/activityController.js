// controllers/penagihanController.js
import chalk from "chalk";
import path from "path";
import {Lelang, nonLelang} from "../utils/data/actData.js";
import { createLelang, createNonLelang, getDebiturWithActs } from "../services/actService.js";

export const createActController = async (req, res) => {
  try {
    const actData = req.body;
    const files = req.files;
    const debiturId = req.query.debiturId;

    if (!debiturId) {
      return res
        .status(400)
        .json({ message: "Debitur ID is required in query parameters" });
    }

    const actFields = { debiturId };

    // Pastikan tindakan ada di actData
    if (!actData.tindakan) {
      return res.status(400).json({ message: "Tindakan is required" });
    }

    // Kondisi berdasarkan nilai tindakan
    if (actData.tindakan === "LELANG") {
      // Looping untuk memasukkan data dari lelang
      Lelang.forEach((field) => {
        if (actData[field]) {
          actFields[field] = actData[field];
        }
      });

      // Looping untuk memproses file foto agunan
      for (let i = 1; i <= 6; i++) {
        if (files[`fotoAgunan${i}`]) {
          actFields[`fotoAgunan${i}`] = path.join(
            "/uploads",
            files[`fotoAgunan${i}`][0].filename
          );
        }
      }

      // Memanggil fungsi createLelang dengan actFields
      const createdLelang = await createLelang(actFields);
      res.status(201).json(createdLelang);
    } else if (actData.tindakan === "NON LELANG") {
      // Looping untuk memasukkan data dari nonLelang
      nonLelang.forEach((field) => {
        if (actData[field]) {
          actFields[field] = actData[field];
        }
      });

      // Looping untuk memproses file foto agunan
      for (let i = 1; i <= 6; i++) {
        if (files[`fotoAgunan${i}`]) {
          actFields[`fotoAgunan${i}`] = path.join(
            "/uploads",
            files[`fotoAgunan${i}`][0].filename
          );
        }
      }

      // Memanggil fungsi createNonLelang dengan actFields
      const createdNonLelang = await createNonLelang(actFields);
      res.status(201).json(createdNonLelang);
    } else {
      res.status(400).json({ message: "Invalid tindakan value" });
    }
  } catch (error) {
    console.error("Error creating act:", error);
    res.status(500).json({ error: error.message });
  }
};


export const getDebiturWithActsController = async (req, res) => {
  const userId = req.user.id_rm;

  console.log("User's ID RM:", userId);

  try {
    const debiturs = await getDebiturWithActs(userId);
    res.status(200).json(debiturs);
  } catch (error) {
    console.error("Error retrieving debiturs:", error);
    res.status(500).json({ error: error.message });
  }
};