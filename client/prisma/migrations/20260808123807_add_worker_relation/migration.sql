-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_assignedWorkerId_fkey" FOREIGN KEY ("assignedWorkerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
