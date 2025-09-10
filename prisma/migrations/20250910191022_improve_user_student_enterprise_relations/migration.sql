/*
  Warnings:

  - You are about to drop the column `description` on the `enterprises` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `enterprises` table. All the data in the column will be lost.
  - You are about to drop the column `is_complete` on the `enterprises` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `enterprises` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `is_complete` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `students` table. All the data in the column will be lost.
  - You are about to alter the column `lattes` on the `students` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `course` on the `students` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `tags_count` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cnpj]` on the table `enterprises` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[initiator_id,receiver_id]` on the table `likes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[registration_number]` on the table `students` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "enterprises" DROP COLUMN "description",
DROP COLUMN "email",
DROP COLUMN "is_complete",
DROP COLUMN "name";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "description",
DROP COLUMN "email",
DROP COLUMN "is_complete",
DROP COLUMN "name",
ALTER COLUMN "lattes" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "course" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "tags_count",
ADD COLUMN     "description" VARCHAR(255),
ADD COLUMN     "is_complete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "enterprises_cnpj_key" ON "enterprises"("cnpj");

-- CreateIndex
CREATE INDEX "enterprises_cnpj_idx" ON "enterprises"("cnpj");

-- CreateIndex
CREATE INDEX "likes_initiator_id_idx" ON "likes"("initiator_id");

-- CreateIndex
CREATE INDEX "likes_receiver_id_idx" ON "likes"("receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_initiator_id_receiver_id_key" ON "likes"("initiator_id", "receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_registration_number_key" ON "students"("registration_number");

-- CreateIndex
CREATE INDEX "students_course_idx" ON "students"("course");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");
