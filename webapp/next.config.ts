import type { NextConfig } from "next";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../.env") });

const nextConfig: NextConfig = {
  serverExternalPackages: ["@telegram-apps/init-data-node"],
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    BOT_USERNAME: process.env.BOT_USERNAME,
    BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    WEBAPP_URL: process.env.WEBAPP_URL,
    ADMIN_TELEGRAM_ID: process.env.ADMIN_TELEGRAM_ID,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.changes.tg",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

if (process.env.NODE_ENV === "development") {
  nextConfig.outputFileTracingRoot = path.join(__dirname, "../../");
}

export default nextConfig;
