/*
  Warnings:

  - The primary key for the `gifts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `gifts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "gifts" DROP CONSTRAINT "gifts_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGINT NOT NULL,
ADD CONSTRAINT "gifts_pkey" PRIMARY KEY ("id");
