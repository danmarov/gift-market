// webapp/src/lib/actions/auth/authenticate-with-init-data.ts
"use server";
import { cookies } from "next/headers";
import { validate, parse } from "@telegram-apps/init-data-node";
import { SignJWT } from "jose";
import { createOrUpdateUser } from "database";
import { safeString } from "@/lib/utils/safe-string";

export async function authenticateWithInitData(initDataRaw: string) {
  try {
    console.log("🔐 Server: Starting initData validation...");

    if (!initDataRaw || typeof initDataRaw !== "string") {
      throw new Error("initDataRaw must be a non-empty string");
    }

    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error(
        "TELEGRAM_BOT_TOKEN environment variable is not configured"
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not configured");
    }

    validate(initDataRaw, process.env.TELEGRAM_BOT_TOKEN, {
      expiresIn: 24 * 60 * 60, // 24 часа
    });

    const initData = parse(initDataRaw);

    if (!initData.user) {
      throw new Error("User data not found in initData");
    }

    const telegramUser = initData.user;
    const telegramId = telegramUser.id.toString();

    console.log("📡 Server: Creating/updating user in database...", telegramId);

    // 2. Создаем/обновляем пользователя в БД
    const user = await createOrUpdateUser({
      telegramId,
      username: safeString(telegramUser.username),
      firstName: safeString(telegramUser.firstName),
      lastName: safeString(telegramUser.lastName),
      photoUrl: safeString(telegramUser.photoUrl),
    });

    console.log("✅ Server: User created/updated:", user.id);

    // 3. Создаем JWT сессию
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const sessionToken = await new SignJWT({
      telegramId: user.telegramId,
      role: user.role,
      firstName: user.firstName,
      id: user.id,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(secret);

    // 4. Устанавливаем cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 часа
    });

    console.log("🍪 Server: Session cookie set");

    return {
      success: true,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        role: user.role,
        firstName: user.firstName,
        username: user.username,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        balance: user.balance,
        onboardingStatus: user.onboardingStatus,
        lastActivity: user.lastActivity,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown server error";
    console.error("❌ Server: Authentication failed:", errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}
