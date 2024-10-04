import prisma from "../utils/prismaClient.js";
import { decryptData } from "../utils/aes.js"; 
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import formatDate from "../utils/date.js";

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


export const createLelang = async (lelangFields) => {
  const {
    debiturId,
    userId,
    jumlah_hasil_lelang,
    input_web_bri,
    ...restFields
  } = lelangFields;

  // Konversi jumlah_hasil_lelang ke integer
  const jumlahHasilLelangInt = parseInt(jumlah_hasil_lelang, 10);

  // Konversi input_web_bri ke format ISO jika ada
  const inputWebBriISO = input_web_bri
    ? new Date(input_web_bri).toISOString()
    : null;

  // Periksa apakah sudah ada data lelang untuk debitur ini
  const existingLelang = await prisma.lelang.findFirst({
    where: { debitur: { id_debitur: debiturId } },
  });

  if (existingLelang) {
    // Kembalikan pesan error dalam bentuk objek
    throw new Error("Debitur sudah memiliki data lelang.");
  }

  // Buat data lelang baru
  const lelang = await prisma.lelang.create({
    data: {
      ...restFields,
      jumlah_hasil_lelang: jumlahHasilLelangInt,
      input_web_bri: inputWebBriISO, // Simpan tanggal dalam format ISO string
      debitur: {
        connect: { id_debitur: debiturId },
      },
    },
  });

  return lelang;
};

export const createNonLelang = async (nonLelangFields) => {
  const { debiturId, userId, ...restFields } = nonLelangFields;

  // Periksa apakah sudah ada data non-lelang untuk debitur ini
  const existingNonLelang = await prisma.nonLelang.findFirst({
    where: { debitur: { id_debitur: debiturId } },
  });

  if (existingNonLelang) {
    // Kembalikan pesan error dalam bentuk objek
    throw new Error("Debitur sudah memiliki data non-lelang.");
  }

  // Buat data non-lelang baru
  const nonLelang = await prisma.nonLelang.create({
    data: {
      ...restFields,
      debitur: {
        connect: { id_debitur: debiturId },
      },
    },
  });

  return nonLelang;
};

// todo
//service
export const updateAct = async (id, tindakan, actFields) => {
  try {
    let updatedRecord;

    // Tentukan tindakan berdasarkan jenis record (LELANG atau NON LELANG)
    if (tindakan === "LELANG") {
      updatedRecord = await prisma.lelang.update({
        where: { id_lelang: id },
        data: actFields,
      });
    } else if (tindakan === "NON LELANG") {
      updatedRecord = await prisma.nonLelang.update({
        where: { id_non_lelang: id },
        data: actFields,
      });
    }

    return updatedRecord;
  } catch (error) {
    throw new Error(`Error updating ${tindakan} record: ${error.message}`);
  }
};


export const getDebiturWithActs = async (userId) => {
  try {
    const debiturs = await prisma.debitur.findMany({
      where: { userId },
      include: {
        lelangs: true,
        non_lelangs: true,
      },
    });

    // Mendekripsi nomor_rekening dan mengonversi tanggal lelang
    const decryptedDebiturs = debiturs.map((debitur) => {
      const lelangsWithFormattedDate = debitur.lelangs.map((lelang) => ({
        ...lelang,
        input_web_bri: formatDate(lelang.input_web_bri),
      }));

      return {
        ...debitur,
        nomor_rekening: decryptData(debitur.nomor_rekening),
        lelangs: lelangsWithFormattedDate,
      };
    });

    return decryptedDebiturs;
  } catch (error) {
    console.log(error)
    throw new Error("Error retrieving debiturs: " + error.message);
  }
};

export const deleteAct = async (id, tindakan) => {
  try {
    let record;

    // Find the record based on the tindakan type
    if (tindakan === "LELANG") {
      record = await prisma.lelang.findUnique({
        where: { id_lelang: id },
      });
    } else if (tindakan === "NON LELANG") {
      record = await prisma.nonLelang.findUnique({
        where: { id_non_lelang: id },
      });
    }

    if (!record) {
      throw new Error(`No record found for ${tindakan} with ID ${id}`);
    }

    // Collect all image paths
    const imageFields = [
      record.fotoAgunan1,
      record.fotoAgunan2,
      record.fotoAgunan3,
      record.fotoAgunan4,
      record.fotoAgunan5,
      record.fotoAgunan6,
    ].filter(Boolean); // Remove null or undefined values

    // Delete all associated files
    const deletePromises = imageFields.map((filePath) =>
      deleteFile(path.join(__dirname, "..", filePath))
    );
    await Promise.all(deletePromises);

    // Finally, delete the record from the database
    if (tindakan === "LELANG") {
      await prisma.lelang.delete({ where: { id_lelang: id } });
    } else if (tindakan === "NON LELANG") {
      await prisma.nonLelang.delete({ where: { id_non_lelang: id } });
    }

    return { message: `Record with ID ${id} and associated files deleted.` };
  } catch (error) {
    throw new Error(`Error deleting record: ${error.message}`);
  }
};



//? ========= Lelang =========
export const countAllAktifitasLelang = async (startDate, endDate) => {
  const whereClause = {};

  // Add date filter if provided
  if (startDate && endDate) {
    whereClause.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const aktifitasLelangTypes = [
    "PEMBERKASAN",
    "UPLOAD",
    "PENETAPAN LELANG",
    "PELAKSANAAN LELANG",
  ];

  const counts = {};

  for (const type of aktifitasLelangTypes) {
    counts[type] = await prisma.lelang.count({
      where: {
        ...whereClause,
        aktifitas_lelang: type,
      },
    });
  }

  return [
    {
      activity: "PEMBERKASAN",
      count: counts["PEMBERKASAN"],
      fill: "var(--color-chrome)",
    },
    {
      activity: "UPLOAD",
      count: counts["UPLOAD"],
      fill: "var(--color-safari)",
    },
    {
      activity: "PENETAPAN LELANG",
      count: counts["PENETAPAN LELANG"],
      fill: "var(--color-firefox)",
    },
    {
      activity: "PELAKSANAAN LELANG",
      count: counts["PELAKSANAAN LELANG"],
      fill: "var(--color-edge)",
    },
  ];
};


export const countAllAktifitasNonLelang = async (startDate, endDate) => {
  const whereClause = {};

  // Add date filter if provided
  if (startDate && endDate) {
    whereClause.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const aktifitasNonLelangTypes = [
    "KLAIM",
    "RESTRUKTURASI",
    "PENYELESAIAN",
    "PENAGIHAN",
    "CESSIE",
  ];

  const counts = {};

  for (const type of aktifitasNonLelangTypes) {
    counts[type] = await prisma.nonLelang.count({
      where: {
        ...whereClause,
        aktifitas_non_lelang: type,
      },
    });
  }

  return [
    {
      activity: "KLAIM",
      count: counts["KLAIM"],
      fill: "var(--color-chrome)",
    },
    {
      activity: "RESTRUKTURASI",
      count: counts["RESTRUKTURASI"],
      fill: "var(--color-safari)",
    },
    {
      activity: "PENYELESAIAN",
      count: counts["PENYELESAIAN"],
      fill: "var(--color-firefox)",
    },
    {
      activity: "PENAGIHAN",
      count: counts["PENAGIHAN"],
      fill: "var(--color-edge)",
    },
    {
      activity: "CESSIE",
      count: counts["CESSIE"],
      fill: "var(--color-other)",
    },
  ];
};

// ? ========= Lelang Group By Branch Code =========

export const countLelangByBranchOffice = async (startDate, endDate) => {
  const whereClause = {};

  // Add date filter if provided
  if (startDate && endDate) {
    whereClause.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const aktifitasLelangTypes = [
    "PEMBERKASAN",
    "UPLOAD",
    "PENETAPAN LELANG",
    "PELAKSANAAN LELANG",
  ];

  const counts = {};

  for (const type of aktifitasLelangTypes) {
    const countByBranchOffice = await prisma.lelang.groupBy({
      by: ["debiturId"],
      where: {
        ...whereClause,
        aktifitas_lelang: type,
      },
      _count: true,
    });

    // Aggregate the counts for each branch_office
    for (const { debiturId, _count } of countByBranchOffice) {
      const debitur = await prisma.debitur.findUnique({
        where: { id_debitur: debiturId },
        select: { branch_office: true },
      });

      if (debitur) {
        const branch = debitur.branch_office;
        counts[branch] = counts[branch] || [];
        counts[branch].push({
          activity: type,
          count: _count,
          fill: getFillColor(type),
        });
      }
    }
  }

  return counts;
};

// Helper function to map activity type to color
const getFillColor = (activity) => {
  const colors = {
    PEMBERKASAN: "var(--color-chrome)",
    UPLOAD: "var(--color-safari)",
    "PENETAPAN LELANG": "var(--color-firefox)",
    "PELAKSANAAN LELANG": "var(--color-edge)",
  };
  return colors[activity];
};


export const countNonLelangByBranchOffice = async (startDate, endDate) => {
  const whereClause = {};

  // Menambahkan filter tanggal jika disediakan
  if (startDate && endDate) {
    whereClause.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const aktifitasNonLelangTypes = [
    "KLAIM",
    "RESTRUKTURASI",
    "PENYELESAIAN",
    "PENAGIHAN",
    "CESSIE",
  ];

  const counts = {};

  for (const type of aktifitasNonLelangTypes) {
    const countByBranchOffice = await prisma.nonLelang.groupBy({
      by: ["debiturId"],
      where: {
        ...whereClause,
        aktifitas_non_lelang: type,
      },
      _count: true,
    });

    // Mengelompokkan hitungan berdasarkan `branch_office`
    for (const { debiturId, _count } of countByBranchOffice) {
      const debitur = await prisma.debitur.findUnique({
        where: { id_debitur: debiturId },
        select: { branch_office: true },
      });

      if (debitur) {
        const branch = debitur.branch_office;
        counts[branch] = counts[branch] || [];
        counts[branch].push({
          activity: type,
          count: _count,
          fill: getNonLelangFillColor(type),
        });
      }
    }
  }

  return counts;
};

// Fungsi pembantu untuk menghubungkan tipe aktivitas dengan warna
const getNonLelangFillColor = (activity) => {
  const colors = {
    KLAIM: "var(--color-chrome)",
    RESTRUKTURASI: "var(--color-safari)",
    PENYELESAIAN: "var(--color-firefox)",
    PENAGIHAN: "var(--color-edge)",
    CESSIE: "var(--color-other)",
  };
  return colors[activity];
};
