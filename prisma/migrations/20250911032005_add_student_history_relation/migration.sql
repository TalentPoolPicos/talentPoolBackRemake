/*
  Warnings:

  - A unique constraint covering the columns `[history_student_id]` on the table `attachments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "history_student_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "attachments_history_student_id_key" ON "attachments"("history_student_id");

-- CreateIndex
CREATE INDEX "attachments_history_student_id_idx" ON "attachments"("history_student_id");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_history_student_id_fkey" FOREIGN KEY ("history_student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
