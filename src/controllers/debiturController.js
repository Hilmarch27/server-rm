import {
  getDebitursByLoggedInUser,
  getDebitursByNama,
  addMultipleDebitur,
  updateDebiturService,
  createAct,
  getActByDebiturId,
} from "../services/debiturService.js";
import { decryptData, encryptData } from "../utils/aes.js"; 
import actRawData from "../utils/data/actData.js";
import path from "path";


export async function getDebitursByLoggedInUserController(req, res) {
  try {
    const pn = req.user.pn;

    console.log("User's PN:", pn);

    const debiturs = await getDebitursByLoggedInUser(pn);

    console.log("Debiturs List found:", debiturs.length);

    const serializedDebiturs = debiturs.map((debitur) => ({
      ...debitur,
      nomorRekening: decryptData(debitur.nomorRekening), // Dekripsi no_rekening
    }));

    res.status(200).json(serializedDebiturs);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getDebitursByNamaController(req, res) {
  try {
    const { nama } = req.params;
    const decodedNama = decodeURIComponent(nama); // Dekode parameter nama debitur

    const debiturs = await getDebitursByNama(decodedNama);

    const serializedDebiturs = debiturs.map((debitur) => ({
      ...debitur,
      nomorRekening: decryptData(debitur.nomorRekening), // Dekripsi no_rekening
    }));

    console.log("Debitur detail:", decodedNama);
    res.status(200).json(serializedDebiturs);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const addMultipleDebiturController = async (req, res) => {
  const debiturs = req.body;

  if (!Array.isArray(debiturs)) {
    return res
      .status(400)
      .json({ error: "Invalid data format. Expected an array of debiturs." });
  }

  const formattedDebiturs = debiturs.map((debitur) => {
    let formattedDebitur = { ...debitur };
    formattedDebitur.nomorRekening = encryptData(
      formattedDebitur.nomorRekening.toString()
    ); // Enkripsi no_rekening
    return formattedDebitur;
  });

  try {
    const newDebiturs = await addMultipleDebitur(formattedDebiturs);

    res.status(201).json({ success: true, count: newDebiturs.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding debiturs." });
  }
};

export const updateDebitur = async (req, res) => {
  const { id } = req.params;
  const { klasifikasiEc } = req.body;

  try {
    const updatedDebitur = await updateDebiturService(id, klasifikasiEc);
    res.status(200).json({ message: "Klasifikasi berhasil diperbarui", data: updatedDebitur });
    console.log("Klasifikasi updated:", updatedDebitur.klasifikasiEc);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
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
          "../uploads",
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


export const getActByDebiturIdController = async (req, res) => {
  const debiturId = req.query.debiturId;
  try {
    const act = await getActByDebiturId(debiturId);
    res.status(200).json(act);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}