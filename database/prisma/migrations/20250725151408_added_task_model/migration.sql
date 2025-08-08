-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('TELEGRAM_SUBSCRIPTION', 'DAILY_BONUS');

-- CreateEnum
CREATE TYPE "TaskDuration" AS ENUM ('ONE_DAY', 'ONE_WEEK', 'ONE_MONTH');

-- CreateEnum
CREATE TYPE "UserTaskStatus" AS ENUM ('AVAILABLE', 'IN_PROGRESS', 'PENDING_CHECK', 'COMPLETED', 'CLAIMED');

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "type" "TaskType" NOT NULL,
    "duration" "TaskDuration" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reward" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "completed_count" INTEGER NOT NULL DEFAULT 0,
    "max_completions" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tasks" (
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "status" "UserTaskStatus" NOT NULL DEFAULT 'AVAILABLE',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "claimed_at" TIMESTAMP(3),

    CONSTRAINT "user_tasks_pkey" PRIMARY KEY ("userId","taskId")
);

-- AddForeignKey
ALTER TABLE "user_tasks" ADD CONSTRAINT "user_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tasks" ADD CONSTRAINT "user_tasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
