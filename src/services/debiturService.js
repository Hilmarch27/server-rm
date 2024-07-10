import prisma from "../utils/prismaClient.js";

export const getDebitursByLoggedInUser = async (pn) => {
  return prisma.debitur.findMany({
    where: { kode_debitur: pn },
  });
};

export const getDebitursByNama = async (nama_debitur) => {
  return prisma.debitur.findMany({
    where: { namaDebitur: nama_debitur },
  });
};

export const addMultipleDebitur = async (debiturs) => {
  return prisma.debitur.createMany({
    data: debiturs,
  });
};

export const updateDebiturService = async (id, klasifikasiEc) => {
  try {
    const updatedDebitur = await prisma.debitur.update({
      where: { id_debitur: id },
      data: { klasifikasiEc },
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

export const getActByDebiturId = async (debiturId) => {
  return prisma.act.findMany({
    where: { debiturId },
  });
};
