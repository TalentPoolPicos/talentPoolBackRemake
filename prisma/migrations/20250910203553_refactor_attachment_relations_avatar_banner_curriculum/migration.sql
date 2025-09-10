/*
  Warnings:

  - You are about to drop the column `curriculum` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `curriculum_uuid` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `history` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `history_uuid` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `banner_picture` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `banner_picture_uuid` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profile_picture` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profile_picture_uuid` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('profile_picture', 'banner_picture', 'curriculum', 'history', 'document', 'image', 'video', 'audio', 'other');

-- AlterTable
ALTER TABLE "students" DROP COLUMN "curriculum",
DROP COLUMN "curriculum_uuid",
DROP COLUMN "history",
DROP COLUMN "history_uuid";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "banner_picture",
DROP COLUMN "banner_picture_uuid",
DROP COLUMN "profile_picture",
DROP COLUMN "profile_picture_uuid";

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "url" VARCHAR(1000),
    "avatar_user_id" INTEGER,
    "banner_user_id" INTEGER,
    "student_id" INTEGER,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attachments_uuid_key" ON "attachments"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "attachments_storage_key_key" ON "attachments"("storage_key");

-- CreateIndex
CREATE UNIQUE INDEX "attachments_avatar_user_id_key" ON "attachments"("avatar_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "attachments_banner_user_id_key" ON "attachments"("banner_user_id");

-- CreateIndex
CREATE INDEX "attachments_avatar_user_id_idx" ON "attachments"("avatar_user_id");

-- CreateIndex
CREATE INDEX "attachments_banner_user_id_idx" ON "attachments"("banner_user_id");

-- CreateIndex
CREATE INDEX "attachments_student_id_type_idx" ON "attachments"("student_id", "type");

-- CreateIndex
CREATE INDEX "attachments_type_idx" ON "attachments"("type");

-- CreateIndex
CREATE INDEX "attachments_storage_key_idx" ON "attachments"("storage_key");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_avatar_user_id_fkey" FOREIGN KEY ("avatar_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_banner_user_id_fkey" FOREIGN KEY ("banner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
