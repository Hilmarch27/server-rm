// src/controllers/debitursController.js

import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import { encryptData, decryptData } from "../utils/aes.js"; 

const prisma = new PrismaClient();

// Fungsi untuk mengambil Debitur berdasarkan pn dari User yang sedang login
export async function getDebitursByLoggedInUser(req, res) {
  try {
    const pn = req.user.pn;

    console.log("User's PN:", pn);

    const debiturs = await prisma.debitur.findMany({
      where: { kode_debitur: pn },
    });

    console.log("Debiturs List found:", debiturs.length);

    const serializedDebiturs = debiturs.map((debitur) => ({
      ...debitur,
      no_rekening: decryptData(debitur.no_rekening), // Dekripsi no_rekening
    }));

    res.status(200).json(serializedDebiturs);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getDebitursByNama(req, res) {
  try {
    const { nama } = req.params;
    const decodedNama = decodeURIComponent(nama); // Dekode parameter nama debitur

    const debiturs = await prisma.debitur.findMany({
      where: { nama_debitur: decodedNama },
    });

    const serializedDebiturs = debiturs.map((debitur) => ({
      ...debitur,
      no_rekening: decryptData(debitur.no_rekening), // Dekripsi no_rekening
    }));

    console.log(chalk.green("Debitur detail:", decodedNama));
    res.status(200).json(serializedDebiturs);
  } catch (error) {
    console.error(chalk.red("Error:", error));
    res.status(500).json({ message: "Internal server error" });
  }
}

// Controller untuk menambahkan beberapa debitur
export const addMultipleDebitur = async (req, res) => {
  const { debiturs } = req.body;

  if (!Array.isArray(debiturs)) {
    return res
      .status(400)
      .json({ error: "Invalid data format. Expected an array of debiturs." });
  }

  const formattedDebiturs = debiturs.map((debitur) => {
    let formattedDebitur = { ...debitur };
    formattedDebitur.no_rekening = encryptData(
      formattedDebitur.no_rekening.toString()
    ); // Enkripsi no_rekening
    return formattedDebitur;
  });

  try {
    const newDebiturs = await prisma.debitur.createMany({
      data: formattedDebiturs,
    });

    res.status(201).json({ success: true, count: newDebiturs.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding debiturs." });
  }
};
