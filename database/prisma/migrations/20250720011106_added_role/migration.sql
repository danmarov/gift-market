-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserOnboardingStatus" AS ENUM ('NEW', 'FIRST_VISIT', 'GIFT_REVEALED', 'TASKS_PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "onboardingStatus" "UserOnboardingStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';
