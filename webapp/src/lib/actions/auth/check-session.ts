// webapp/src/lib/actions/auth/check-session.ts
"use server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { findUserByTelegramId } from "database";
import { JWTSessionSchema } from "@/lib/types/session";

export async function checkSession(telegramIdFromInitData?: string) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return { success: false, reason: "no_token" };
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(sessionToken, secret);

    const sessionValidation = JWTSessionSchema.safeParse(payload);

    if (!sessionValidation.success) {
      console.error(
        "Invalid JWT payload in checkSession:",
        sessionValidation.error
      );
      return { success: false, reason: "invalid_token" };
    }

    const session = sessionValidation.data;

    // 🔥 НОВАЯ ПРОВЕРКА: сравниваем telegramId из токена с telegramId из initData
    if (
      telegramIdFromInitData &&
      session.telegramId !== telegramIdFromInitData
    ) {
      console.log(
        `🚫 Telegram ID mismatch detected! Session: ${session.telegramId}, InitData: ${telegramIdFromInitData}`
      );

      // Очищаем сессию при несоответствии
      const cookieStore = await cookies();
      cookieStore.delete("session");

      return {
        success: false,
        reason: "telegram_id_mismatch",
      };
    }

    const user = await findUserByTelegramId(session.telegramId);

    if (!user) {
      return { success: false, reason: "user_not_found" };
    }

    if (user.role !== session.role) {
      console.log(
        `🔄 Role changed for ${user.telegramId}: ${session.role} -> ${user.role}`
      );

      const cookieStore = await cookies();
      cookieStore.delete("session");

      return { success: false, reason: "role_changed" };
    }

    return {
      success: true,
      user: {
        id: user.id,
        telegramId: session.telegramId,
        role: user.role,
        firstName: session.firstName || user.firstName,
        username: user.username,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        balance: user.balance,
        onboardingStatus: user.onboardingStatus,
        lastActivity: user.lastActivity,
      },
    };
  } catch (error) {
    console.error("Session check error:", error);
    return { success: false, reason: "invalid_token" };
  }
}
