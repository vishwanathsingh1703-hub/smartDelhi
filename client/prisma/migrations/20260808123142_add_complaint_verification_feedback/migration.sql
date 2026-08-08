-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "assignedWorkerId" TEXT,
ADD COLUMN     "citizenVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "citizenVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "workCompletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "workerId" TEXT,
    "rating" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_complaintId_key" ON "Feedback"("complaintId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
