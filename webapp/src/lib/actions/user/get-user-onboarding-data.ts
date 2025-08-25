// lib/actions/user/get-user-onboarding-data.ts
"use server";

import {
  findUserByTelegramId,
  getUserWonGift,
  conductLootBoxDraw,
  updateUserOnboardingStatus,
  UserOnboardingStatus,
} from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

async function _getUserOnboardingData(session: JWTSession): Promise<{
  success: boolean;
  data?: {
    onboardingStatus: UserOnboardingStatus;
    gift: {
      name: string;
      mediaUrl: string;
      revealAnimation?: string | null;
    };
  };
  error?: string;
}> {
  try {
    console.log("📋 [SERVER] Getting onboarding data for user:", session.id);

    // Получаем пользователя из БД
    const user = await findUserByTelegramId(session.telegramId);

    if (!user) {
      throw new Error("User not found");
    }

    console.log("👤 [SERVER] User onboarding status:", user.onboardingStatus);

    let finalStatus = user.onboardingStatus;
    let giftData = null;

    // ⭐ ЕСЛИ СТАТУС NEW - СРАЗУ РАЗЫГРЫВАЕМ ПОДАРОК
    if (user.onboardingStatus === UserOnboardingStatus.NEW) {
      console.log("🎲 [SERVER] Auto-drawing gift for NEW user");

      try {
        // Разыгрываем подарок
        const draw = await conductLootBoxDraw(user.id);

        // Обновляем статус пользователя: NEW -> GIFT_REVEALED
        await updateUserOnboardingStatus(
          user.id,
          UserOnboardingStatus.GIFT_REVEALED
        );

        finalStatus = UserOnboardingStatus.GIFT_REVEALED;

        giftData = {
          name: draw.prize.gift.name,
          mediaUrl: draw.prize.gift.mediaUrl,
          revealAnimation: draw.prize.gift.revealAnimation,
        };

        console.log("✅ [SERVER] Gift auto-drawn:", giftData.name);
      } catch (drawError) {
        console.error("💥 [SERVER] Error auto-drawing gift:", drawError);
        console.error("💥 [SERVER] Draw error details:", {
          userId: user.id,
          userTelegramId: user.telegramId,
          error:
            drawError instanceof Error ? drawError.message : String(drawError),
        });
        throw drawError; // Пробрасываем оригинальную ошибку для большей детализации
      }
    } else if (
      user.onboardingStatus === UserOnboardingStatus.GIFT_REVEALED ||
      user.onboardingStatus === UserOnboardingStatus.CHANNELS_COMPLETED ||
      user.onboardingStatus === UserOnboardingStatus.ALL_COMPLETED ||
      user.onboardingStatus === UserOnboardingStatus.COMPLETED
    ) {
      // Получаем уже выигранный подарок
      console.log("🎁 [SERVER] Getting existing won gift");

      const wonGift = await getUserWonGift(user.id); // Используем user.id

      if (!wonGift) {
        console.error("❌ [SERVER] No won gift found, attempting recovery");

        // Попробуйте найти по telegram ID
        const alternativeGift = await getUserWonGift(user.telegramId);

        if (!alternativeGift) {
          // Крайний случай - сбросить статус и заново разыграть
          console.log("🔄 [SERVER] Resetting user status and redrawing");
          await updateUserOnboardingStatus(user.id, UserOnboardingStatus.NEW);

          // Рекурсивно вызвать функцию заново
          return _getUserOnboardingData(session);
        }

        giftData = {
          name: alternativeGift.prize.gift.name,
          mediaUrl: alternativeGift.prize.gift.mediaUrl,
          revealAnimation: alternativeGift.prize.gift.revealAnimation,
        };
      } else {
        // ⭐ ИСПРАВЛЕНИЕ: Устанавливаем giftData когда подарок найден!
        giftData = {
          name: wonGift.prize.gift.name,
          mediaUrl: wonGift.prize.gift.mediaUrl,
          revealAnimation: wonGift.prize.gift.revealAnimation,
        };

        console.log("✅ [SERVER] Existing gift found:", giftData.name);
      }
    }

    if (!giftData) {
      throw new Error("No gift data available");
    }

    return {
      success: true,
      data: {
        onboardingStatus: finalStatus,
        gift: giftData,
      },
    };
  } catch (error) {
    console.error("💥 [SERVER] Error getting onboarding data:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get onboarding data",
    };
  }
}

export const getUserOnboardingData = withServerAuth(_getUserOnboardingData);
