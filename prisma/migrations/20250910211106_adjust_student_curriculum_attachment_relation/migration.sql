/*
  Warnings:

  - You are about to drop the column `student_id` on the `attachments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[curriculum_student_id]` on the table `attachments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_student_id_fkey";

-- DropIndex
DROP INDEX "attachments_student_id_type_idx";

-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "student_id",
ADD COLUMN     "curriculum_student_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "attachments_curriculum_student_id_key" ON "attachments"("curriculum_student_id");

-- CreateIndex
CREATE INDEX "attachments_curriculum_student_id_idx" ON "attachments"("curriculum_student_id");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_curriculum_student_id_fkey" FOREIGN KEY ("curriculum_student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
