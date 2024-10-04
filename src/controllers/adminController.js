// controllers/adminController.js
import { getAllDebiturWithRelatedData } from "../services/adminService.js";
import { decryptData } from "../utils/aes.js";
import formatDate from "../utils/date.js";
import { stringify as csvStringify } from "csv-stringify/sync";


export const getAll = async (req, res) => {
  try {
    const debiturs = await getAllDebiturWithRelatedData();

    // Dekripsi nomor rekening untuk setiap debitur
    const decryptedDebiturs = debiturs.map((data) => ({
      ...data,
      nomor_rekening: decryptData(data.nomor_rekening), // Dekripsi nomor rekening
    }));

    res.status(200).json(decryptedDebiturs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadAllCsv = async (req, res) => {
  try {
    const debiturs = await getAllDebiturWithRelatedData();

    const serializedDebiturs = debiturs.map((debitur) => ({
      ...debitur,
      tanggal_charge_off: formatDate(debitur.tanggal_charge_off),
      nomor_rekening: decryptData(debitur.nomor_rekening),
    }));

    // Format the data to include fields from Debitur, User, Lelang, and NonLelang
    const formattedDebiturs = serializedDebiturs.map((debitur) => {
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
          debitur.tanggal_charge_off || "kosong",
        "Klasifikasi EC": debitur.klasifikasiEc || "kosong",
        "Aging PH 1": debitur.aging_ph_1 || "kosong",
        "Aging PH 2": debitur.aging_ph_2 || "kosong",
        // User data
        "Nama Pengguna": debitur.user.nama || "kosong",
        "PN Pengguna": debitur.user.pn || "kosong",
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
      "Nama Pengguna",
      "PN Pengguna",
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
    res.setHeader("Content-Disposition", 'attachment; filename="admin-debiturs.csv"');
    res.status(200).send(csv);
  } catch (error) {
    console.error("Error retrieving debiturs:", error);
    res.status(500).json({ error: error.message });
  }
};

