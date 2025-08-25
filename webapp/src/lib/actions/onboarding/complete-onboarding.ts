"use server";
import {
  updateUserOnboardingStatus,
  UserOnboardingStatus,
  findUserById,
  getUserUnclaimedDraws,
  claimLootBoxPrize,
  createPurchase as createPurchaseDb,
  markPurchaseAsSent,
} from "database";
import { JWTSession } from "@/lib/types/session";
import { withServerAuth } from "../auth/with-server-auth";
import { sendGift, notifyAdmin } from "../bot";

export type CompleteOnboardingResult =
  | { success: true; message: string }
  | { success: false; error: string };

async function _completeOnboarding(
  session: JWTSession
): Promise<CompleteOnboardingResult> {
  try {
    console.log("🏁 [SERVER] Completing onboarding for user:", session.id);

    // Получаем актуальные данные пользователя
    const user = await findUserById(session.id);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Проверяем статус
    if (user.onboardingStatus !== UserOnboardingStatus.ALL_COMPLETED) {
      return {
        success: false,
        error: `Cannot complete onboarding. Current status: ${user.onboardingStatus}`,
      };
    }

    // Получаем незабранные выигрыши
    const unclaimedDraws = await getUserUnclaimedDraws(session.id);
    if (unclaimedDraws.length === 0) {
      return { success: false, error: "No unclaimed gifts found" };
    }

    const currentDraw = unclaimedDraws[0];
    const claimedDraw = await claimLootBoxPrize(currentDraw.id);

    // Обновляем статус на COMPLETED
    await updateUserOnboardingStatus(
      session.id,
      UserOnboardingStatus.COMPLETED
    );

    console.log("🎉 [SERVER] Onboarding completed, status set to COMPLETED!");

    // Создаем запись о "покупке" (бесплатной)
    const purchase = await createPurchaseDb({
      buyerId: session.id,
      giftId: claimedDraw.prize.gift.id,
      quantity: 1,
      totalPrice: 0,
      pricePerItem: 0,
    });

    const gift = claimedDraw.prize.gift;

    console.log("🎁 Purchase created for claimed gift:", {
      id: purchase.id,
      hasTelegramGiftId: !!(
        gift.telegramGiftId && gift.telegramGiftId.trim() !== ""
      ),
    });

    // Проверяем, можем ли отправить автоматически
    if (gift.telegramGiftId && gift.telegramGiftId.trim() !== "") {
      console.log("🤖 Attempting automatic gift delivery...");

      try {
        // Пытаемся отправить подарок через Telegram API
        const giftSent = await sendGift({
          userId: session.telegramId,
          giftId: gift.telegramGiftId,
          text: ``,
          parseMode: "HTML",
        });

        if (!giftSent) {
          throw new Error("Failed to send claimed gift");
        }

        // Если подарок отправлен успешно, обновляем статус на SENT
        await markPurchaseAsSent(
          purchase.id,
          undefined, // telegramMessageId не нужен для автоматических
          `Автоматически отправлен выигранный подарок через Telegram API`
        );

        console.log("✅ Automatic delivery successful!");

        // Уведомляем админа об успешной автоматической отправке
        await notifyAdmin({
          message: `
🎉 <b>Выигранный подарок отправлен автоматически!</b>

👤 Пользователь: ${session.telegramId}
🎁 Подарок: ${gift.name} (выигран)
💰 Стоимость: Бесплатно
🤖 Статус: Автоматически отправлен
📅 Время: ${new Date().toLocaleString()}

✅ Все задачи выполнены
          `,
          keyboard: "webapp",
          webappButtonText: "📈 Открыть историю",
          webappUrl: `${process.env.WEBAPP_URL}/admin/orders`,
        });

        return {
          success: true,
          message: `🎉 Ваш подарок уже в пути`,
        };
      } catch (autoError: any) {
        console.error("❌ Automatic delivery failed:", autoError);

        // Получаем сообщение об ошибке
        const errorMessage = autoError?.message || "Неизвестная ошибка";

        // Автоматическая отправка не удалась, оставляем в ручном режиме
        await notifyAdmin({
          message: `
⚠️ <b>Выигранный подарок требует ручной отправки!</b>

👤 Пользователь: ${session.telegramId}
🎁 Подарок: ${gift.name} (выигран)
💰 Стоимость: Бесплатно
🤖 Автоматическая отправка не удалась: ${errorMessage}
📅 Время: ${new Date().toLocaleString()}

✅ Все задачи выполнены
❗ Требуется ручная обработка заказа
          `,
          keyboard: "webapp",
          webappButtonText: "📦 Обработать заказ",
          webappUrl: `${process.env.WEBAPP_URL}/admin/orders`,
        });

        return {
          success: true,
          message: `🎉 Ваш подарок уже в пути`,
        };
      }
    } else {
      // Это кастомный подарок, требуется ручная отправка
      console.log("📦 Manual delivery required (no telegramGiftId)");

      await notifyAdmin({
        message: `
🎉 <b>Новый выигранный подарок (ручная отправка)!</b>

👤 Пользователь: ${session.telegramId}
🎁 Подарок: ${gift.name} (выигран)
💰 Стоимость: Бесплатно
📅 Время: ${new Date().toLocaleString()}

✅ Все задачи выполнены
❗ Требуется ручная обработка
        `,
        keyboard: "webapp",
        webappButtonText: "📦 Обработать заказ",
        webappUrl: `${process.env.WEBAPP_URL}/admin/orders`,
      });

      return {
        success: true,
        message: `🎉 Ваш подарок уже в пути`,
      };
    }
  } catch (error) {
    console.error("💥 [SERVER] Error completing onboarding:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to complete onboarding",
    };
  }
}

export const completeOnboarding = withServerAuth(_completeOnboarding);
