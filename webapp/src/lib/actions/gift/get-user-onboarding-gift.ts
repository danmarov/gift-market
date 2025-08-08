// lib/actions/gift/get-user-onboarding-gift.ts
"use server";

import { getUserLootBoxDraws, findUserById } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

export type GetUserOnboardingGiftResult =
  | {
      success: true;
      data: {
        gift: {
          name: string;
          mediaUrl: string;
        };
        drawId: string;
        wonAt: Date;
      } | null; // null если нет подарка
    }
  | { success: false; error: string };

async function _getUserOnboardingGift(
  session: JWTSession
): Promise<GetUserOnboardingGiftResult> {
  try {
    console.log("🎁 [SERVER] Getting onboarding gift for user:", session.id);

    // Получаем пользователя для проверки статуса
    const user = await findUserById(session.id);

    if (!user) {
      throw new Error("User not found");
    }

    console.log("👤 [SERVER] User onboarding status:", user.onboardingStatus);

    // Если статус NEW - подарка еще нет
    if (user.onboardingStatus === "NEW") {
      console.log("🆕 [SERVER] User is NEW, no gift yet");
      return {
        success: true,
        data: null,
      };
    }

    // Если статус GIFT_REVEALED или COMPLETED - ищем подарок
    const draws = await getUserLootBoxDraws(session.id);

    if (draws.length === 0) {
      console.log(
        "❌ [SERVER] No draws found for user with status:",
        user.onboardingStatus
      );
      throw new Error("No gift found for user with revealed status");
    }

    // Берем последний (самый свежий) выигрыш
    const latestDraw = draws[0];

    console.log("✅ [SERVER] Found onboarding gift:", {
      drawId: latestDraw.id,
      giftName: latestDraw.prize.gift.name,
      wonAt: latestDraw.wonAt,
    });

    return {
      success: true,
      data: {
        gift: {
          name: latestDraw.prize.gift.name,
          mediaUrl: latestDraw.prize.gift.mediaUrl,
        },
        drawId: latestDraw.id,
        wonAt: latestDraw.wonAt,
      },
    };
  } catch (error) {
    console.error("💥 [SERVER] Error getting onboarding gift:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Ошибка при получении подарка",
    };
  }
}

export const getUserOnboardingGift = withServerAuth(_getUserOnboardingGift);
