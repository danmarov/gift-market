// lib/actions/gift/draw-gift.ts
"use server";

import {
  conductLootBoxDraw,
  updateUserOnboardingStatus,
  findUserById,
  UserOnboardingStatus,
} from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

export type DrawGiftResult =
  | {
      success: true;
      data: {
        draw: any;
        gift: {
          name: string;
          mediaUrl: string;
        };
      };
    }
  | { success: false; error: string };

async function _drawGift(session: JWTSession): Promise<DrawGiftResult> {
  try {
    console.log("🎲 [SERVER] Drawing gift for user:", session.id);

    // Получаем актуальные данные пользователя из БД
    const user = await findUserById(session.id);

    if (!user) {
      throw new Error("User not found");
    }

    console.log("👤 [SERVER] User onboarding status:", user.onboardingStatus);

    // СТРОГАЯ ПРОВЕРКА: розыгрыш доступен ТОЛЬКО для NEW пользователей
    if (user.onboardingStatus !== UserOnboardingStatus.NEW) {
      throw new Error(
        `Gift draw is only available for NEW users. Current status: ${user.onboardingStatus}`
      );
    }

    console.log("🎲 [SERVER] Conducting new gift draw");

    // Проводим розыгрыш
    const draw = await conductLootBoxDraw(session.id);

    // Обновляем статус онбординга: NEW -> GIFT_REVEALED
    await updateUserOnboardingStatus(
      session.id,
      UserOnboardingStatus.GIFT_REVEALED
    );

    console.log("🎁 [SERVER] Gift drawn successfully:", {
      drawId: draw.id,
      prizeId: draw.prizeId,
      giftName: draw.prize.gift.name,
    });

    console.log("🎯 [SERVER] User onboarding status updated to GIFT_REVEALED");

    return {
      success: true,
      data: {
        draw,
        gift: {
          name: draw.prize.gift.name,
          mediaUrl: draw.prize.gift.mediaUrl,
        },
      },
    };
  } catch (error) {
    console.error("💥 [SERVER] Error drawing gift:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Ошибка при розыгрыше подарка",
    };
  }
}

export const drawGift = withServerAuth(_drawGift);
