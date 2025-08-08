-- CreateEnum
CREATE TYPE "BackdropVariant" AS ENUM ('YELLOW', 'BLUE');

-- CreateTable
CREATE TABLE "gifts" (
    "id" TEXT NOT NULL,
    "telegram_gift_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "media_url" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sold_count" INTEGER NOT NULL DEFAULT 0,
    "special_offer" BOOLEAN NOT NULL DEFAULT false,
    "backdrop_variant" "BackdropVariant" NOT NULL DEFAULT 'YELLOW',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gifts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gifts_telegram_gift_id_key" ON "gifts"("telegram_gift_id");
