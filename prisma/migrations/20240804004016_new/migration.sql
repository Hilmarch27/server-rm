/*
  Warnings:

  - You are about to alter the column `out_standing` on the `Debitur` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Debitur" ALTER COLUMN "out_standing" SET DATA TYPE INTEGER;
