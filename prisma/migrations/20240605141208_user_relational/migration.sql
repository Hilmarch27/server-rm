-- DropForeignKey
ALTER TABLE "Penagihan" DROP CONSTRAINT "Penagihan_userId_fkey";

-- AlterTable
ALTER TABLE "Penagihan" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Penagihan" ADD CONSTRAINT "Penagihan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id_rm") ON DELETE SET NULL ON UPDATE CASCADE;
