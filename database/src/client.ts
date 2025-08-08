import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import path from "path";

const envPath = path.resolve(__dirname, "../../.env");
console.log("🔍 Loading .env from:", envPath);
config({ path: envPath });

// Дебаг переменных окружения
console.log("🔍 DATABASE_URL:", process.env.DATABASE_URL);
console.log("🔍 NODE_ENV:", process.env.NODE_ENV);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
