-- CreateEnum
CREATE TYPE "Kolektibitas" AS ENUM ('Kol_1', 'Kol_2', 'Kol_3', 'Kol_4', 'Kol_5');

-- CreateTable
CREATE TABLE "User" (
    "id_rm" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "pn" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_rm")
);

-- CreateTable
CREATE TABLE "Debitur" (
    "id_debitur" TEXT NOT NULL,
    "kode_debitur" INTEGER NOT NULL,
    "kode_uker" INTEGER NOT NULL,
    "nama_debitur" TEXT NOT NULL,
    "no_rekening" TEXT NOT NULL,
    "segmen" TEXT NOT NULL,
    "tgl_charge" TEXT NOT NULL,
    "pokok" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Debitur_pkey" PRIMARY KEY ("id_debitur")
);

-- CreateTable
CREATE TABLE "Penagihan" (
    "id_penagihan" TEXT NOT NULL,
    "jml_ditagih" BIGINT NOT NULL,
    "kolektibitas" "Kolektibitas" NOT NULL DEFAULT 'Kol_1',
    "debiturId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Penagihan_pkey" PRIMARY KEY ("id_penagihan")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_pn_key" ON "User"("pn");

-- AddForeignKey
ALTER TABLE "Penagihan" ADD CONSTRAINT "Penagihan_debiturId_fkey" FOREIGN KEY ("debiturId") REFERENCES "Debitur"("id_debitur") ON DELETE RESTRICT ON UPDATE CASCADE;
