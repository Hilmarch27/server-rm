// services/adminService.js
import prisma from "../utils/prismaClient.js";

export const getAllDebiturWithRelatedData = async () => {
  try {
    const debiturs = await prisma.debitur.findMany({
      include: {
        user: {
          select: {
            nama: true,
            pn: true,
          },
        },
        lelangs: true,
        non_lelangs: true,
      },
    });
    return debiturs;
  } catch (error) {
    console.error("Error fetching debiturs with related data: ", error);
    throw new Error("Unable to fetch debitur data.");
  }
};
