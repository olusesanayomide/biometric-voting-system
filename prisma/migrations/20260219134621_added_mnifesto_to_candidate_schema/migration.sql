-- AlterEnum
ALTER TYPE "ElectionStatus" ADD VALUE 'PAUSED';

-- AlterTable
ALTER TABLE "Ballot" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "manifesto" TEXT;
