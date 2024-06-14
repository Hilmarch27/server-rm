-- AlterTable
ALTER TABLE "Pemberkasan" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Pemberkasan" ADD CONSTRAINT "Pemberkasan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id_rm") ON DELETE SET NULL ON UPDATE CASCADE;
