/*
  Warnings:

  - Changed the type of `no_rekening` on the `Debitur` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Debitur" DROP COLUMN "no_rekening",
ADD COLUMN     "no_rekening" BIGINT NOT NULL;
