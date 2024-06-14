/*
  Warnings:

  - You are about to alter the column `jml_ditagih` on the `Penagihan` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Penagihan" ALTER COLUMN "jml_ditagih" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "Pemberkasan" (
    "id_pemberkasan" TEXT NOT NULL,
    "tgl_act" TEXT NOT NULL,
    "no_shm" INTEGER NOT NULL,
    "npwp" INTEGER NOT NULL,
    "nl" TEXT NOT NULL,
    "alm_shm" TEXT NOT NULL,
    "pic" TEXT NOT NULL,
    "tgl_target" TEXT NOT NULL,
    "progres" TEXT NOT NULL,
    "bln_lelang" TEXT NOT NULL,
    "tgl_lelang" TEXT NOT NULL,
    "no_laku_lelang" INTEGER NOT NULL,
    "limit_lelang" TEXT NOT NULL,
    "info_lelang" TEXT NOT NULL,
    "tgl_up_info_lelang" TEXT NOT NULL,
    "lokasi_nasabah" TEXT NOT NULL,
    "alamat_nasabah" TEXT NOT NULL,
    "foto_depan" TEXT NOT NULL,
    "foto_kiri" TEXT NOT NULL,
    "foto_kanan" TEXT NOT NULL,
    "foto_dalam_rumah1" TEXT NOT NULL,
    "foto_dalam_rumah2" TEXT NOT NULL,
    "foto_dalam_rumah3" TEXT NOT NULL,
    "tgl_ots" TEXT NOT NULL,
    "rm_ots" TEXT NOT NULL,
    "agunan" TEXT NOT NULL,
    "pemasaran_jaminan" TEXT NOT NULL,
    "debiturId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pemberkasan_pkey" PRIMARY KEY ("id_pemberkasan")
);

-- AddForeignKey
ALTER TABLE "Pemberkasan" ADD CONSTRAINT "Pemberkasan_debiturId_fkey" FOREIGN KEY ("debiturId") REFERENCES "Debitur"("id_debitur") ON DELETE RESTRICT ON UPDATE CASCADE;
