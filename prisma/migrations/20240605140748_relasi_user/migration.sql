/*
  Warnings:

  - Added the required column `userId` to the `Penagihan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Penagihan" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Penagihan" ADD CONSTRAINT "Penagihan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id_rm") ON DELETE RESTRICT ON UPDATE CASCADE;
