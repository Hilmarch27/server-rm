import { encryptData } from "../utils/aes.js";
import prisma from "../utils/prismaClient.js";
import XLSX from "xlsx";

export const getDebitursByLoggedInUser = async (userId) => {
  return prisma.debitur.findMany({
    where: { userId: userId }, // Ganti pencarian berdasarkan userId
  });
};
export const getDebitursByNama = async (nama_debitur) => {
  return prisma.debitur.findMany({
    where: { nama_debitur: nama_debitur }, // Field yang sesuai dengan schema
  });
};

export const addMultipleDebitur = async (debiturs) => {
  return prisma.debitur.createMany({
    data: debiturs,
  });
};

// Service: Create a single Debitur
export const addSingleDebitur = async (debitur) => {
  return prisma.debitur.create({
    data: debitur,
  });
};

export const updateKlasifikasiEcService = async (id, klasifikasiEc) => {
  try {
    const updatedDebitur = await prisma.debitur.update({
      where: { id_debitur: id }, // Menggunakan id_debitur sesuai dengan Prisma schema
      data: { klasifikasiEc }, // Mengupdate field klasifikasiEc
    });
    return updatedDebitur;
  } catch (error) {
    throw new Error("Error memperbarui debitur: " + error.message);
  }
};

// activity
export const createAct = async (actFields) => {
  const { debiturId, userId, ...restFields } = actFields;

  const act = await prisma.act.create({
    data: {
      ...restFields,
      debitur: {
        connect: { id_debitur: debiturId },
      },
      user: {
        connect: { id_rm: userId },
      },
    },
  });

  return act;
};

export const updateAct = async (actId, actFields) => {
  const { debiturId, userId, ...restFields } = actFields;

  const act = await prisma.act.update({
    where: { id_act: actId },
    data: {
      ...restFields,
      debitur: {
        connect: { id_debitur: debiturId },
      },
      user: {
        connect: { id_rm: userId },
      },
    },
  });

  return act;
};


export const getActByDebiturId = async (userId) => {
  return prisma.act.findMany({
    where: {
      userId,
    },
    include: {
      debitur: {
        select: {
          branchCode: true,
          branchOffice: true,
          uker: true,
          namaDebitur: true,
          nomorRekening: true,
          outStanding: true,
          noTelp: true,
        },
      },
      user: {
        select: {
          id_rm: true,
        },
      },
    },
  });
};

// Layanan untuk mengonversi Excel ke JSON dan menyimpan ke database
export const convertExcelToJsonAndSave = async (fileBuffer, userId) => {
  // Parse file Excel
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0]; // Mengasumsikan data ada di sheet pertama
  const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // Konversi data berdasarkan schema Prisma
  const convertedData = worksheet.map((row) => ({
    aging_ph_1: Number(row.aging_ph_1),
    aging_ph_2: Number(row.aging_ph_2),
    branch_code: row.branch_code,
    branch_office: row.branch_office,
    desc_loan: row.desc_loan,
    intra_ekstra: row.intra_ekstra,
    klasifikasiEc: row.klasifikasiEc, // Mengasumsikan string sesuai dengan enum
    kolektibilitas: row.kolektibilitas,
    nama_debitur: row.nama_debitur,
    nomor_rekening: encryptData(row.nomor_rekening),
    out_standing: Number(row.out_standing),
    phone: row.phone,
    pn_pengelola: row.pn_pengelola,
    segmen: row.segmen,
    tanggal_charge_off: new Date(row.tanggal_charge_off), // Konversi ke Date
    uker: row.uker,
    userId: userId,
  }));

  // Simpan data ke dalam database menggunakan Prisma
  try {
    const result = await prisma.debitur.createMany({
      data: convertedData,
      skipDuplicates: true // Menghindari error jika ada data duplikat
    });
    return result;
  } catch (error) {
    console.error('Gagal menyimpan data ke database:', error);
    throw error;
  }
};

