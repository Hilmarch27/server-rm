import prisma from "../utils/prismaClient.js";
import { decryptData } from "../utils/aes.js"; 

export const createLelang = async (lelangFields) => {
  const { debiturId, userId, jumlah_hasil_lelang, ...restFields } =
    lelangFields;

  // Konversi jumlah_hasil_lelang ke integer
  const jumlahHasilLelangInt = parseInt(jumlah_hasil_lelang, 10);

  try {
    const lelang = await prisma.lelang.create({
      data: {
        ...restFields,
        jumlah_hasil_lelang: jumlahHasilLelangInt, // Gunakan nilai yang sudah dikonversi
        debitur: {
          connect: { id_debitur: debiturId },
        },
      },
    });

    return lelang;
  } catch (error) {
    throw new Error("Error creating lelang: " + error.message);
  }
};
export const createNonLelang = async (nonLelangFields) => {
  const { debiturId, userId, ...restFields } = nonLelangFields;

  try {
    const nonLelang = await prisma.nonLelang.create({
      data: {
        ...restFields,
        debitur: {
          connect: { id_debitur: debiturId },
        },
      },
    });

    return nonLelang;
  } catch (error) {
    throw new Error("Error creating non-lelang: " + error.message);
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

    // Mendekripsi nomor_rekening
    const decryptedDebiturs = debiturs.map((debitur) => {
      return {
        ...debitur,
        nomor_rekening: decryptData(debitur.nomor_rekening),
      };
    });

    return decryptedDebiturs;
  } catch (error) {
    throw new Error("Error retrieving debiturs: " + error.message);
  }
};