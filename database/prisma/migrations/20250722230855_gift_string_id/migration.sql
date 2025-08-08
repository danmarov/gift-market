/*
  Warnings:

  - The primary key for the `gifts` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "gifts" DROP CONSTRAINT "gifts_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "gifts_pkey" PRIMARY KEY ("id");
