/*
  Warnings:

  - You are about to drop the column `company_id` on the `jobs` table. All the data in the column will be lost.
  - Added the required column `enterprise_id` to the `jobs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "job_applications" DROP CONSTRAINT "job_applications_student_id_fkey";

-- DropForeignKey
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_company_id_fkey";

-- DropIndex
DROP INDEX "jobs_company_id_idx";

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "company_id",
ADD COLUMN     "enterprise_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "jobs_enterprise_id_idx" ON "jobs"("enterprise_id");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
