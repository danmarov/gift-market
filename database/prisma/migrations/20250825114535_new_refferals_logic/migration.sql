/*
  Warnings:

  - You are about to drop the `referrals` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."UserOnboardingStatus" ADD VALUE 'CHANNELS_COMPLETED';

-- DropForeignKey
ALTER TABLE "public"."referrals" DROP CONSTRAINT "referrals_referred_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."referrals" DROP CONSTRAINT "referrals_referrer_id_fkey";

-- DropTable
DROP TABLE "public"."referrals";

-- CreateTable
CREATE TABLE "public"."Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "reward" INTEGER NOT NULL DEFAULT 0,
    "is_validated" BOOLEAN NOT NULL DEFAULT false,
    "validated_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referredId_key" ON "public"."Referral"("referredId");

-- AddForeignKey
ALTER TABLE "public"."Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Referral" ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
