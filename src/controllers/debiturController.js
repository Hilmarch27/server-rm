import {
  getDebitursByLoggedInUser,
  getDebitursByNama,
  addMultipleDebitur,
  updateKlasifikasiEcService,
  convertExcelToJsonAndSave,
  addSingleDebitur,
} from "../services/debiturService.js";
import { decryptData, encryptData } from "../utils/aes.js";
import { stringify as csvStringify } from "csv-stringify/sync";
import formatDate from "../utils/date.js";

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

// Controller: Create a single Debitur
export async function createSingleDebiturController(req, res) {
  try {
    // Extract debitur data from the request body
    const debitur = req.body;

    // Retrieve userId from the authenticated user (assuming it's available in req.user)
    const userId = req.user?.id_rm;

    console.log("User ID from request:", userId); // Debugging log

    // Validate debitur data
    if (!debitur || Object.keys(debitur).length === 0) {
      return res.status(400).json({ message: "Invalid debitur data" });
    }

    // Encrypt the debitur's nomor_rekening
    const encryptedDebitur = {
      ...debitur,
      nomor_rekening: encryptData(debitur.nomor_rekening),
      userId, // Add userId from authenticated user
    };

    console.log("Encrypted Debitur:", encryptedDebitur); // Debugging log

    // Add the debitur to the database
    const result = await addSingleDebitur(encryptedDebitur);

    // Return success response
    res.status(201).json({
      message: "Debitur created successfully",
      debitur: result,
    });
  } catch (error) {
    console.error("Error creating debitur:", error);
    res.status(500).json({ message: "Failed to create debitur" });
  }
}


export const updateKlasifikasiEcController = async (req, res) => {
  const { id } = req.params; // Mengambil id dari parameter URL
  const { klasifikasiEc } = req.body; // Mengambil klasifikasiEc dari request body

  try {
    const updatedDebitur = await updateKlasifikasiEcService(id, klasifikasiEc); // Memanggil service untuk memperbarui data
    res.status(200).json({
      message: "Klasifikasi berhasil diperbarui",
      data: updatedDebitur,
    }); // Mengirimkan respons yang sesuai
    console.log("Klasifikasi updated:", updatedDebitur.klasifikasiEc); // Logging untuk debugging
  } catch (error) {
    console.error(error.message); // Logging error untuk debugging
    res.status(500).json({ message: "Terjadi kesalahan pada server" }); // Mengirimkan respons error
  }
};
//? ============ Download CSV ===========

export const downloadLaporanDebiturCsv = async (req, res) => {
  const userId = req.user.id_rm;

  try {
    const debiturs = await getDebitursByLoggedInUser(userId);
    const serializedDebiturs = debiturs.map((debitur) => ({
      ...debitur,
      tanggal_charge_off: formatDate(debitur.tanggal_charge_off),
      nomor_rekening: decryptData(debitur.nomor_rekening),
    }));

    // Format the data to include fields from Debitur, Lelang, and NonLelang
    const formattedDebiturs = serializedDebiturs.map((debitur, idx) => {
      return {
        No: idx + 1,
        "Branch Code": debitur.branch_code || "kosong",
        "Branch Office": debitur.branch_office || "kosong",
        "Unit Kerja": debitur.uker || "kosong",
        "PN Pengelola": debitur.pn_pengelola || "kosong",
        "Nama Debitur": debitur.nama_debitur || "kosong",
        "Nomor Rekening": debitur.nomor_rekening || "kosong",
        Outstanding: debitur.out_standing || "kosong",
        Segmen: debitur.segmen || "kosong",
        Phone: debitur.phone || "kosong",
        "Deskripsi Loan": debitur.desc_loan || "kosong",
        "Intra Ekstra": debitur.intra_ekstra || "kosong",
        Kolektibilitas: debitur.kolektibilitas || "kosong",
        "Tanggal Charge Off": debitur.tanggal_charge_off || "kosong", // Tidak ada .toISOString()
        "Klasifikasi EC": debitur.klasifikasiEc || "kosong",
        "Aging PH 1": debitur.aging_ph_1 || "kosong",
        "Aging PH 2": debitur.aging_ph_2 || "kosong",
      };
    });

    // Define the columns and their order for the CSV
    const columns = [
      "No",
      "Kode Debitur",
      "Branch Code",
      "Branch Office",
      "Unit Kerja",
      "PN Pengelola",
      "Nama Debitur",
      "Nomor Rekening",
      "Outstanding",
      "Segmen",
      "Phone",
      "Deskripsi Loan",
      "Intra Ekstra",
      "Kolektibilitas",
      "Tanggal Charge Off",
      "Klasifikasi EC",
      "Aging PH 1",
      "Aging PH 2",
    ];

    // Generate the CSV string
    const csv = csvStringify(formattedDebiturs, { header: true, columns });

    // Send the CSV file as a response
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="debiturs.csv"');
    res.status(200).send(csv);
  } catch (error) {
    console.error("Error retrieving debiturs:", error);
    res.status(500).json({ error: error.message });
  }
};


export const uploadExcel = async (req, res) => {
  const userId = req.user.id_rm; // Ambil userId dari session pengguna
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang diunggah" });
    }

    // Konversi dan simpan data Excel ke database
    const result = await convertExcelToJsonAndSave(req.file.buffer, userId);

    // Kirim respons berhasil
    res
      .status(200)
      .json({ message: "Data berhasil diunggah dan disimpan", data: result });
  } catch (error) {
    console.log("Gagal memproses file:", error);
    res.status(500).json({ message: "Gagal memproses file", error });
  }
};