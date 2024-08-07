import {
  getDebitursByLoggedInUser,
  getDebitursByNama,
  addMultipleDebitur,
  createAct,
  getActByDebiturId,
  updateAct,
  deleteAct,
  updateKlasifikasiEcService,
} from "../services/debiturService.js";
import { decryptData, encryptData } from "../utils/aes.js"; 
import path from "path";
import logger from "../utils/logger.js";


export async function getDebitursByLoggedInUserController(req, res) {
  try {
    // Ambil id_rm dari objek user yang sudah ada di req
    const userId = req.user.id_rm;

    console.log("User's ID RM:", userId);

    // Panggil fungsi service dengan userId
    const debiturs = await getDebitursByLoggedInUser(userId);

    console.log("Debiturs List found:", debiturs.length);

    // Dekripsi nomor_rekening setiap debitur
    const serializedDebiturs = debiturs.map((debitur) => ({
      ...debitur,
      nomor_rekening: decryptData(debitur.nomor_rekening), // Dekripsi no_rekening
    }));

    res.status(200).json(serializedDebiturs);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getDebitursByNamaController(req, res) {
  try {
    const { nama } = req.params; // Ambil parameter nama dari URL
    const decodedNama = decodeURIComponent(nama); // Dekode parameter nama debitur

    const debiturs = await getDebitursByNama(decodedNama); // Ambil debiturs berdasarkan nama

    // Dekripsi nomor_rekening setiap debitur
    const serializedDebiturs = debiturs.map((debitur) => ({
      ...debitur,
      nomor_rekening: decryptData(debitur.nomor_rekening), // Dekripsi no_rekening
    }));

    console.log("Debitur detail:", decodedNama);
    res.status(200).json(serializedDebiturs);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createMultipleDebiturController(req, res) {
  try {
    // Ambil data debitur dari request body
    const { debiturs } = req.body;

    // Ambil userId dari objek user yang sudah ada di req
    const userId = req.user?.id_rm;

    console.log("User ID from request:", userId); // Tambahkan log untuk debug

    // Validasi data debitur
    if (!Array.isArray(debiturs) || debiturs.length === 0) {
      return res.status(400).json({ message: "Invalid debitur data" });
    }

    // Enkripsi nomor_rekening setiap debitur
    const encryptedDebiturs = debiturs.map((debitur) => ({
      ...debitur,
      nomor_rekening: encryptData(debitur.nomor_rekening),
      userId, // Menambahkan userId yang diambil dari req.user
    }));

    console.log("Encrypted Debiturs:", encryptedDebiturs); // Tambahkan log untuk debug

    // Tambahkan debitur ke database
    const result = await addMultipleDebitur(encryptedDebiturs);

    res.status(201).json({
      message: "Debiturs created successfully",
      count: result.count,
    });
  } catch (error) {
    console.error("Error creating debiturs:", error);
    res.status(500).json({ message: "Failed to create debiturs" });
  }
}

export const updateKlasifikasiEcController = async (req, res) => {
  const { id } = req.params; // Mengambil id dari parameter URL
  const { klasifikasiEc } = req.body; // Mengambil klasifikasiEc dari request body

  try {
    const updatedDebitur = await updateKlasifikasiEcService(id, klasifikasiEc); // Memanggil service untuk memperbarui data
    res
      .status(200)
      .json({
        message: "Klasifikasi berhasil diperbarui",
        data: updatedDebitur,
      }); // Mengirimkan respons yang sesuai
    console.log("Klasifikasi updated:", updatedDebitur.klasifikasiEc); // Logging untuk debugging
  } catch (error) {
    console.error(error.message); // Logging error untuk debugging
    res.status(500).json({ message: "Terjadi kesalahan pada server" }); // Mengirimkan respons error
  }
};

// activity
export const createActController = async (req, res) => {
  try {
    const actData = req.body;
    const files = req.files;
    const debiturId = req.query.debiturId; // Mengambil debiturId dari req.query
    const userId = req.user?.id_rm;

    if (!debiturId) {
      return res
        .status(400)
        .json({ message: "Debitur ID is required in query parameters" });
    }

    // Inisialisasi objek actFields dengan debiturId dan userId
    const actFields = { debiturId, userId };

    // Looping untuk memasukkan data dari actRawData
    const fields = actRawData; // Pastikan actRawData sudah didefinisikan sebelumnya
    fields.forEach((field) => {
      if (actData[field]) {
        actFields[field] = actData[field];
        console.log(`Set ${field} to:`, actData[field]); // Log setiap field yang diset
      }
    });

    // Looping untuk memproses file foto agunan
    for (let i = 1; i <= 6; i++) {
      if (files[`fotoAgunan${i}`]) {
        actFields[`fotoAgunan${i}`] = path.join(
          "/uploads",
          files[`fotoAgunan${i}`][0].filename
        );
        console.log(
          `Added fotoAgunan${i} with path:`,
          actFields[`fotoAgunan${i}`]
        ); // Log setiap foto agunan yang ditambahkan
      }
    }

    // Log actFields yang akan digunakan untuk membuat act
    console.log("Act fields to be created:", actFields);

    // Memanggil fungsi createAct dengan actFields dan menunggu hasilnya
    const createdAct = await createAct(actFields);

    // Log act yang berhasil dibuat
    console.log("Created act:", createdAct);

    // Mengirim respons ke client dengan status 201 dan data act yang baru dibuat
    res.status(201).json(createdAct);
  } catch (error) {
    // Tangani kesalahan yang terjadi dan kirim respons error ke client
    console.error("Error creating act:", error);
    res.status(500).json({ error: error.message });
  }
};

// Controller untuk update act
export const updateActController = async (req, res) => {
  try {
    const actId = req.params.id;
    const actData = req.body;
    const files = req.files;
    const debiturId = req.query.debiturId;
    const userId = req.user?.id_rm;

    // Logging untuk mencatat permintaan yang masuk
    logger.info(`Update request received for Act ID: ${actId}`);

    if (!debiturId) {
      return res
        .status(400)
        .json({ message: "Debitur ID is required in query parameters" });
    }

    const actFields = { debiturId, userId };

    // Logging untuk mencatat data yang dikirim dalam body
    logger.info("Act data received", actData);

    const fields = actRawData; // Pastikan actRawData sudah didefinisikan sebelumnya
    fields.forEach((field) => {
      if (actData[field]) {
        actFields[field] = actData[field];
      }
    });

    for (let i = 1; i <= 6; i++) {
      if (files[`fotoAgunan${i}`]) {
        actFields[`fotoAgunan${i}`] = path.join(
          "/uploads",
          files[`fotoAgunan${i}`][0].filename
        );

        // Logging untuk mencatat file yang diunggah
        logger.info(
          `Uploaded file for fotoAgunan${i}:`,
          files[`fotoAgunan${i}`][0].filename
        );
      }
    }

    // Logging sebelum memanggil service untuk update act
    logger.info(`Updating Act ID: ${actId} with fields:`, actFields);

    const updatedAct = await updateAct(actId, actFields);

    // Logging setelah berhasil memperbarui act
    logger.info(`Act ID: ${actId} successfully updated`);

    res.status(200).json(updatedAct);
  } catch (error) {
    // Logging untuk menangkap dan melaporkan error yang terjadi
    console.error("Error updating act:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteActController = async (req, res) => {
  try {
    const { actId } = req.params;

    if (!actId) {
      return res.status(400).json({ message: "Act ID is required" });
    }

    const deletedAct = await deleteAct(actId);

    res.status(200).json({ message: "Act deleted successfully", deletedAct });
  } catch (error) {
    console.error("Error deleting act:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getActByDebiturIdController = async (req, res) => {
  const userId = req.user?.id_rm; // Extract userId from req.user

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: No user ID found" });
  }

  try {
    const acts = await getActByDebiturId(userId);

    const decryptedActs = acts.map((act) => ({
      ...act,
      debitur: {
        ...act.debitur,
        nomorRekening: decryptData(act.debitur.nomorRekening),
      },
    }));

    res.status(200).json(decryptedActs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}