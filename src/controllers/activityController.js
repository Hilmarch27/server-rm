// controllers/penagihanController.js
import chalk from "chalk";
import path from "path";
import {Lelang, nonLelang} from "../utils/data/actData.js";
import { countAllAktifitasLelang, countAllAktifitasNonLelang, countLelangByBranchOffice, countNonLelangByBranchOffice, createLelang, createNonLelang, deleteAct, getDebiturWithActs, updateAct } from "../services/actService.js";
import { stringify as csvStringify } from "csv-stringify/sync";
import fs from "fs";
import { fileURLToPath } from "url";
import prisma from "../utils/prismaClient.js";

// Manually define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to delete a file
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

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
      deleteUploadedFiles(files); // Hapus file yang sudah diunggah
      return res.status(400).json({ message: "Tindakan is required" });
    }

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

      try {
        // Memanggil fungsi createLelang dengan actFields
        const createdLelang = await createLelang(actFields);
        return res.status(201).json(createdLelang);
      } catch (error) {
        deleteUploadedFiles(files); // Hapus file yang sudah diunggah jika ada kesalahan
        if (error.message === "Debitur sudah memiliki data lelang.") {
          return res.status(409).json({ message: error.message });
        }
        return res
          .status(500)
          .json({ message: "Error creating lelang: " + error.message });
      }
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

      try {
        // Memanggil fungsi createNonLelang dengan actFields
        const createdNonLelang = await createNonLelang(actFields);
        return res.status(201).json(createdNonLelang);
      } catch (error) {
        deleteUploadedFiles(files); // Hapus file yang sudah diunggah jika ada kesalahan
        if (error.message === "Debitur sudah memiliki data non-lelang.") {
          return res.status(409).json({ message: error.message });
        }
        return res
          .status(500)
          .json({ message: "Error creating non-lelang: " + error.message });
      }
    } else {
      deleteUploadedFiles(files); // Hapus file yang sudah diunggah
      return res.status(400).json({ message: "Invalid tindakan value" });
    }
  } catch (error) {
    deleteUploadedFiles(req.files); // Hapus file yang sudah diunggah jika ada kesalahan lain
    console.error("Error creating act:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Fungsi untuk menghapus file yang sudah diunggah
const deleteUploadedFiles = (files) => {
  if (!files) return;
  Object.keys(files).forEach((key) => {
    files[key].forEach((file) => {
      fs.unlink(file.path, (err) => {
        if (err) console.error("Failed to delete file:", file.path, err);
        else console.log("Successfully deleted file:", file.path);
      });
    });
  });
};

// todo
// Update controller
export const editActController = async (req, res) => {
  const { actId } = req.params;
  const { tindakan } = req.body;
  const files = req.files;

  console.log(`Request received with actId: ${actId}, tindakan: ${tindakan}`);

  if (!actId || !tindakan) {
    console.log("ID atau tindakan tidak disediakan.");
    return res.status(400).json({ message: "ID dan tindakan diperlukan" });
  }

  try {
    const actFields = {};

    // Ambil data act berdasarkan ID dan tindakan
    let currentRecord;
    if (tindakan === "LELANG") {
      console.log(`Fetching record for LELANG with ID: ${actId}`);
      currentRecord = await prisma.lelang.findUnique({
        where: { id_lelang: actId },
      });
    } else if (tindakan === "NON LELANG") {
      console.log(`Fetching record for NON LELANG with ID: ${actId}`);
      currentRecord = await prisma.nonLelang.findUnique({
        where: { id_non_lelang: actId },
      });
    }

    if (!currentRecord) {
      console.log(`No record found for ${tindakan} with ID ${actId}`);
      return res
        .status(404)
        .json({ message: `No record found for ${tindakan} with ID ${actId}` });
    }

    console.log(`Record found:`, currentRecord);

    // Looping untuk memeriksa dan memperbarui data lelang atau non lelang
    if (tindakan === "LELANG") {
      console.log("Processing LELANG fields...");
      [
        "aktifitas_lelang",
        "lelang_ke",
        "nl_lama",
        "nl_baru",
        "kelengkapan_berkas",
        "nomor_tiket",
        "hasil_lelang",
        "input_web_bri",
        "alamat_agunan",
      ].forEach((field) => {
        if (req.body[field]) {
          actFields[field] = req.body[field];
          console.log(`Updated field ${field}: ${req.body[field]}`);
        }
      });

      // Konversi jumlah_hasil_lelang ke integer
      if (req.body.jumlah_hasil_lelang) {
        actFields.jumlah_hasil_lelang = parseInt(
          req.body.jumlah_hasil_lelang,
          10
        );
        console.log(
          `jumlah_hasil_lelang parsed as integer: ${actFields.jumlah_hasil_lelang}`
        );
        if (isNaN(actFields.jumlah_hasil_lelang)) {
          console.log("Invalid jumlah_hasil_lelang value.");
          return res
            .status(400)
            .json({
              message:
                "Invalid jumlah_hasil_lelang value. It must be a valid number.",
            });
        }
      }

      // Looping untuk memeriksa file foto agunan
      for (let i = 1; i <= 6; i++) {
        const newFile = files[`fotoAgunan${i}`];
        const currentFilePath = currentRecord[`fotoAgunan${i}`];

        if (newFile) {
          const newFilePath = path.join("/uploads", newFile[0].filename);
          console.log(`New file detected for fotoAgunan${i}: ${newFilePath}`);

          // Jika file yang baru berbeda dengan file lama, hapus file lama
          if (currentFilePath && currentFilePath !== newFilePath) {
            console.log(
              `Deleting old file for fotoAgunan${i}: ${currentFilePath}`
            );
            await deleteFile(path.join(__dirname, "..", currentFilePath));
          }

          // Tetapkan jalur file baru
          actFields[`fotoAgunan${i}`] = newFilePath;
        } else if (currentFilePath) {
          console.log(
            `Retaining old file for fotoAgunan${i}: ${currentFilePath}`
          );
          actFields[`fotoAgunan${i}`] = currentFilePath;
        }
      }
    } else if (tindakan === "NON LELANG") {
      console.log("Processing NON LELANG fields...");
      [
        "aktifitas_non_lelang",
        "extraordinary",
        "recovery_non_lelang",
        "nl_lama",
        "nl_baru",
        "alamat_agunan",
      ].forEach((field) => {
        if (req.body[field]) {
          actFields[field] = req.body[field];
          console.log(`Updated field ${field}: ${req.body[field]}`);
        }
      });

      // Looping untuk memeriksa file foto agunan
      for (let i = 1; i <= 6; i++) {
        const newFile = files[`fotoAgunan${i}`];
        const currentFilePath = currentRecord[`fotoAgunan${i}`];

        if (newFile) {
          const newFilePath = path.join("/uploads", newFile[0].filename);
          console.log(`New file detected for fotoAgunan${i}: ${newFilePath}`);

          // Jika file yang baru berbeda dengan file lama, hapus file lama
          if (currentFilePath && currentFilePath !== newFilePath) {
            console.log(
              `Deleting old file for fotoAgunan${i}: ${currentFilePath}`
            );
            await deleteFile(path.join(__dirname, "..", currentFilePath));
          }

          // Tetapkan jalur file baru
          actFields[`fotoAgunan${i}`] = newFilePath;
        } else if (currentFilePath) {
          console.log(
            `Retaining old file for fotoAgunan${i}: ${currentFilePath}`
          );
          actFields[`fotoAgunan${i}`] = currentFilePath;
        }
      }
    } else {
      console.log("Nilai tindakan tidak valid.");
      return res.status(400).json({ message: "Nilai tindakan tidak valid" });
    }

    console.log(`Updating act with fields:`, actFields);

    // Memanggil fungsi updateAct dengan actFields
    const updatedAct = await updateAct(actId, tindakan, actFields);
    console.log(`Act updated successfully:`, updatedAct);
    res.status(200).json(updatedAct);
  } catch (error) {
    console.error("Error updating act:", error);
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

export const deleteActController = async (req, res) => {
  const { id } = req.params;
  const { tindakan } = req.query; // Pass tindakan as query parameter

  if (!id || !tindakan) {
    return res.status(400).json({ message: "ID and tindakan are required" });
  }

  try {
    // Call the delete function
    const result = await deleteAct(id, tindakan);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting act:", error);
    res.status(500).json({ error: error.message });
  }
};

//? ============ Download CSV ===========
export const downloadLaporanRMCsv = async (req, res) => {
  // const userId = req.user.id_rm;
  const userId = req.user.id_rm;

  try {
    const debiturs = await getDebiturWithActs(userId);

    // Format the data to include fields from Debitur, Lelang, and NonLelang
    const formattedDebiturs = debiturs.map((debitur) => {
      // Mendapatkan data lelang pertama atau mengisi dengan 'kosong'
      const lelang = debitur.lelangs[0] || {
        tindakan: "kosong",
        aktifitas_lelang: "kosong",
        lelang_ke: "kosong",
        nl_lama: "kosong",
        nl_baru: "kosong",
        kelengkapan_berkas: "kosong",
        nomor_tiket: "kosong",
        jumlah_hasil_lelang: "kosong",
        hasil_lelang: "kosong",
        input_web_bri: "kosong",
        alamat_agunan: "kosong",
      };

      // Mendapatkan data non-lelang pertama atau mengisi dengan 'kosong'
      const nonLelang = debitur.non_lelangs[0] || {
        tindakan: "kosong",
        aktifitas_non_lelang: "kosong",
        extraordinary: "kosong",
        recovery_non_lelang: "kosong",
        nl_lama: "kosong",
        nl_baru: "kosong",
        alamat_agunan: "kosong",
      };

      return {
        "ID Debitur": debitur.id_debitur,
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
        "Tanggal Charge Off":
          debitur.tanggal_charge_off.toISOString() || "kosong",
        "Klasifikasi EC": debitur.klasifikasiEc || "kosong",
        "Aging PH 1": debitur.aging_ph_1 || "kosong",
        "Aging PH 2": debitur.aging_ph_2 || "kosong",
        // Fields from Lelang
        "Tindakan Lelang": lelang.tindakan,
        "Aktifitas Lelang": lelang.aktifitas_lelang,
        "Lelang Ke": lelang.lelang_ke,
        "NL Lama Lelang": lelang.nl_lama,
        "NL Baru Lelang": lelang.nl_baru,
        "Kelengkapan Berkas Lelang": lelang.kelengkapan_berkas,
        "Nomor Tiket Lelang": lelang.nomor_tiket,
        "Jumlah Hasil Lelang": lelang.jumlah_hasil_lelang,
        "Hasil Lelang": lelang.hasil_lelang,
        "Input Web BRI Lelang": lelang.input_web_bri,
        "Alamat Agunan Lelang": lelang.alamat_agunan,
        // Fields from NonLelang
        "Tindakan Non-Lelang": nonLelang.tindakan,
        "Aktifitas Non-Lelang": nonLelang.aktifitas_non_lelang,
        "Extraordinary Non-Lelang": nonLelang.extraordinary,
        "Recovery Non-Lelang": nonLelang.recovery_non_lelang,
        "NL Lama Non-Lelang": nonLelang.nl_lama,
        "NL Baru Non-Lelang": nonLelang.nl_baru,
        "Alamat Agunan Non-Lelang": nonLelang.alamat_agunan,
      };
    });

    // Define the columns and their order for the CSV
    const columns = [
      "ID Debitur",
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
      "Tindakan Lelang",
      "Aktifitas Lelang",
      "Lelang Ke",
      "NL Lama Lelang",
      "NL Baru Lelang",
      "Kelengkapan Berkas Lelang",
      "Nomor Tiket Lelang",
      "Jumlah Hasil Lelang",
      "Hasil Lelang",
      "Input Web BRI Lelang",
      "Alamat Agunan Lelang",
      "Tindakan Non-Lelang",
      "Aktifitas Non-Lelang",
      "Extraordinary Non-Lelang",
      "Recovery Non-Lelang",
      "NL Lama Non-Lelang",
      "NL Baru Non-Lelang",
      "Alamat Agunan Non-Lelang",
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


//? ============ Lelang ===========
export const getAllAktifitasLelangCounts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const counts = await countAllAktifitasLelang(startDate, endDate);

    return res.status(200).json(counts);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while retrieving the data" });
  }
};

//? ============ Non Lelang ===========
export const getAllAktifitasNonLelangCounts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const counts = await countAllAktifitasNonLelang(startDate, endDate);

    return res.status(200).json(counts);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while retrieving the data" });
  }
};

// ? ============ Lelang By Branch Office ===========
export const getLelangCountByBranchOffice = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const counts = await countLelangByBranchOffice(startDate, endDate);
    return res.status(200).json(counts);
  } catch (error) {
    console.error("Error counting lelangs:", error);
    return res.status(500).json({ error: "Failed to count lelangs" });
  }
};

export const getNonLelangCountByBranchOffice = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const counts = await countNonLelangByBranchOffice(startDate, endDate);
    return res.status(200).json(counts);
  } catch (error) {
    console.error("Error counting non-lelangs:", error);
    return res.status(500).json({ error: "Failed to count non-lelangs" });
  }
};

