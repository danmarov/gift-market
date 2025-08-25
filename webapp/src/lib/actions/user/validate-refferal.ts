"use server";
import { validateReferral, getUserValidatedReferralsCount } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";
import { sendMessageToUser } from "../bot";

async function _validateRefferal(session: JWTSession) {
  try {
    // Проверяем и валидируем пользователя как реферала
    const referralResult = await validateReferral(session.id);

    // Если реферал не найден
    if (!referralResult.success) {
      // Нет реферала — ничего делать не нужно
      return { success: true, data: { validated: false, referals: 0 } };
    }

    // Проверяем количество валидированных рефералов у пользователя
    const referals = await getUserValidatedReferralsCount(session.id);

    // Если реферал уже валидирован, возвращаем только success
    if (!referralResult.telegramId) {
      return {
        success: true,
        data: {
          validated: false,
          referals,
        },
      };
    }

    // Отправляем сообщение в Telegram только если начислен бонус
    if (referralResult.bonusAwarded) {
      console.log(
        `📩 Sending Telegram message to referrer with telegramId ${referralResult.telegramId} about new validated referral and bonus`
      );

      const rewardStars = 5;
      const notificationText = `<b>🎉 Новый реферал!</b>\nВы получили бонус в размере <b>${rewardStars} ⭐</b>.`;

      try {
        await sendMessageToUser(referralResult.telegramId, notificationText, {
          parseMode: "HTML",
        });
      } catch (notificationError) {
        console.error(
          "❌ [SERVER] Failed to send referral notification:",
          notificationError
        );
      }
    }

    // Если реферал только что валидирован, возвращаем без telegramId на клиент
    return {
      success: true,
      data: {
        validated: true,
        referals,
      },
    };
  } catch (error) {
    console.error("Error validating referral:", error);
    return { success: false, error: "Failed to validate referral" };
  }
}

export const validateRefferal = withServerAuth(_validateRefferal);
