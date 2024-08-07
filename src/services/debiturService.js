import prisma from "../utils/prismaClient.js";

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

export const deleteAct = async (actId) => {
  const act = await prisma.act.delete({
    where: { id_act: actId },
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
