/*
  Warnings:

  - The values [DAILY_BONUS] on the enum `TaskType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."TaskType_new" AS ENUM ('TELEGRAM_SUBSCRIPTION', 'FREE_BONUS');
ALTER TABLE "public"."tasks" ALTER COLUMN "type" TYPE "public"."TaskType_new" USING ("type"::text::"public"."TaskType_new");
ALTER TYPE "public"."TaskType" RENAME TO "TaskType_old";
ALTER TYPE "public"."TaskType_new" RENAME TO "TaskType";
DROP TYPE "public"."TaskType_old";
COMMIT;
