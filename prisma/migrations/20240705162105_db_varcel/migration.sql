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
    "kode_debitur" INTEGER NOT NULL,
    "branchCode" TEXT NOT NULL,
    "branchOffice" TEXT NOT NULL,
    "uker" TEXT NOT NULL,
    "namaDebitur" TEXT NOT NULL,
    "nomorRekening" TEXT NOT NULL,
    "outStanding" DOUBLE PRECISION NOT NULL,
    "noTelp" TEXT NOT NULL,
    "rmPengelola" TEXT NOT NULL,
    "pn" TEXT NOT NULL,
    "segmen" TEXT NOT NULL,
    "descLoan" TEXT NOT NULL,
    "intraEkstra" TEXT NOT NULL,
    "kolektibilitas" TEXT NOT NULL,
    "tanggalChargeOff" TIMESTAMP(3) NOT NULL,
    "klasifikasiEc" "KlasifikasiEC" NOT NULL,
    "agingPh1" INTEGER,
    "agingPh2" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Debitur_pkey" PRIMARY KEY ("id_debitur")
);

-- CreateTable
CREATE TABLE "Act" (
    "id_act" TEXT NOT NULL,
    "debiturId" TEXT NOT NULL,
    "klasifikasiEc" TEXT NOT NULL,
    "tindakan" TEXT NOT NULL,
    "actifitasLelang" TEXT NOT NULL,
    "actifitasNonLelang" TEXT NOT NULL,
    "extraordinary" TEXT NOT NULL,
    "hasilLelang" TEXT NOT NULL,
    "kelengkapanBerkas" TEXT NOT NULL,
    "lelangKe" TEXT NOT NULL,
    "nlLama" TEXT NOT NULL,
    "nlBaru" TEXT NOT NULL,
    "nomorTicket" TEXT NOT NULL,
    "jumlahHasilLelang" TEXT NOT NULL,
    "recoveryNonLelang" TEXT NOT NULL,
    "inputWebInfoLelangBri" TEXT NOT NULL,
    "alamatAgunan" TEXT NOT NULL,
    "fotoAgunan1" TEXT,
    "fotoAgunan2" TEXT,
    "fotoAgunan3" TEXT,
    "fotoAgunan4" TEXT,
    "fotoAgunan5" TEXT,
    "fotoAgunan6" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Act_pkey" PRIMARY KEY ("id_act")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_pn_key" ON "User"("pn");

-- AddForeignKey
ALTER TABLE "Act" ADD CONSTRAINT "Act_debiturId_fkey" FOREIGN KEY ("debiturId") REFERENCES "Debitur"("id_debitur") ON DELETE RESTRICT ON UPDATE CASCADE;
