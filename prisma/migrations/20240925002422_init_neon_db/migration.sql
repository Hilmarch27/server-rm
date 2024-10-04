-- CreateEnum
CREATE TYPE "KlasifikasiEC" AS ENUM ('GOLD', 'SILVER', 'BRONZE', 'HABIS_AGUNAN');

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
    "branch_code" TEXT NOT NULL,
    "branch_office" TEXT NOT NULL,
    "uker" TEXT NOT NULL,
    "userId" TEXT,
    "pn_pengelola" TEXT NOT NULL,
    "nama_debitur" TEXT NOT NULL,
    "nomor_rekening" TEXT NOT NULL,
    "out_standing" INTEGER NOT NULL,
    "segmen" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "desc_loan" TEXT NOT NULL,
    "intra_ekstra" TEXT NOT NULL,
    "kolektibilitas" TEXT NOT NULL,
    "tanggal_charge_off" TIMESTAMP(3) NOT NULL,
    "klasifikasiEc" "KlasifikasiEC" NOT NULL,
    "aging_ph_1" INTEGER,
    "aging_ph_2" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Debitur_pkey" PRIMARY KEY ("id_debitur")
);

-- CreateTable
CREATE TABLE "Lelang" (
    "id_lelang" TEXT NOT NULL,
    "tindakan" TEXT NOT NULL,
    "aktifitas_lelang" TEXT NOT NULL,
    "lelang_ke" TEXT NOT NULL,
    "nl_lama" TEXT NOT NULL,
    "nl_baru" TEXT NOT NULL,
    "kelengkapan_berkas" TEXT NOT NULL,
    "nomor_tiket" TEXT NOT NULL,
    "jumlah_hasil_lelang" INTEGER NOT NULL,
    "hasil_lelang" TEXT NOT NULL,
    "input_web_bri" TIMESTAMP(3) NOT NULL,
    "alamat_agunan" TEXT NOT NULL,
    "fotoAgunan1" TEXT,
    "fotoAgunan2" TEXT,
    "fotoAgunan3" TEXT,
    "fotoAgunan4" TEXT,
    "fotoAgunan5" TEXT,
    "fotoAgunan6" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "debiturId" TEXT NOT NULL,

    CONSTRAINT "Lelang_pkey" PRIMARY KEY ("id_lelang")
);

-- CreateTable
CREATE TABLE "NonLelang" (
    "id_non_lelang" TEXT NOT NULL,
    "tindakan" TEXT NOT NULL,
    "aktifitas_non_lelang" TEXT NOT NULL,
    "extraordinary" TEXT NOT NULL,
    "recovery_non_lelang" TEXT NOT NULL,
    "nl_lama" TEXT NOT NULL,
    "nl_baru" TEXT NOT NULL,
    "alamat_agunan" TEXT NOT NULL,
    "fotoAgunan1" TEXT,
    "fotoAgunan2" TEXT,
    "fotoAgunan3" TEXT,
    "fotoAgunan4" TEXT,
    "fotoAgunan5" TEXT,
    "fotoAgunan6" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "debiturId" TEXT NOT NULL,

    CONSTRAINT "NonLelang_pkey" PRIMARY KEY ("id_non_lelang")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_pn_key" ON "User"("pn");

-- AddForeignKey
ALTER TABLE "Debitur" ADD CONSTRAINT "Debitur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id_rm") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lelang" ADD CONSTRAINT "Lelang_debiturId_fkey" FOREIGN KEY ("debiturId") REFERENCES "Debitur"("id_debitur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonLelang" ADD CONSTRAINT "NonLelang_debiturId_fkey" FOREIGN KEY ("debiturId") REFERENCES "Debitur"("id_debitur") ON DELETE RESTRICT ON UPDATE CASCADE;
