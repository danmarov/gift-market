/*
  Warnings:

  - The values [FIRST_VISIT,TASKS_PENDING] on the enum `UserOnboardingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "LootBoxDrawStatus" AS ENUM ('WON', 'CLAIMED');

-- AlterEnum
BEGIN;
CREATE TYPE "UserOnboardingStatus_new" AS ENUM ('NEW', 'GIFT_REVEALED', 'COMPLETED');
ALTER TABLE "users" ALTER COLUMN "onboardingStatus" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "onboardingStatus" TYPE "UserOnboardingStatus_new" USING ("onboardingStatus"::text::"UserOnboardingStatus_new");
ALTER TYPE "UserOnboardingStatus" RENAME TO "UserOnboardingStatus_old";
ALTER TYPE "UserOnboardingStatus_new" RENAME TO "UserOnboardingStatus";
DROP TYPE "UserOnboardingStatus_old";
ALTER TABLE "users" ALTER COLUMN "onboardingStatus" SET DEFAULT 'NEW';
COMMIT;

-- CreateTable
CREATE TABLE "loot_box_prizes" (
    "id" TEXT NOT NULL,
    "gift_id" TEXT NOT NULL,
    "dropChance" DOUBLE PRECISION NOT NULL,
    "max_wins" INTEGER,
    "current_wins" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loot_box_prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loot_box_draws" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "prize_id" TEXT NOT NULL,
    "status" "LootBoxDrawStatus" NOT NULL DEFAULT 'WON',
    "won_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimed_at" TIMESTAMP(3),

    CONSTRAINT "loot_box_draws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loot_box_tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'telegram',
    "channel_id" TEXT NOT NULL,
    "chat_id" TEXT,
    "channel_url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loot_box_tasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "loot_box_prizes" ADD CONSTRAINT "loot_box_prizes_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loot_box_draws" ADD CONSTRAINT "loot_box_draws_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loot_box_draws" ADD CONSTRAINT "loot_box_draws_prize_id_fkey" FOREIGN KEY ("prize_id") REFERENCES "loot_box_prizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
