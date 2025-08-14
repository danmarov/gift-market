"use server";
import {
  getActiveLootBoxTasks,
  updateUserOnboardingStatus,
  getUserUnclaimedDraws,
  claimLootBoxPrize,
  findUserById,
  UserOnboardingStatus,
  createPurchase as createPurchaseDb,
  markPurchaseAsSent,
  processReferralOnboardingReward,
} from "database";
import { JWTSession } from "@/lib/types/session";
import { withServerAuth } from "../auth/with-server-auth";
import {
  isUserMemberOfChannel,
  notifyAdmin,
  sendGift,
  sendMessageToUser,
} from "../bot";

export type ClaimGiftResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
      missingSubscriptions?: string[];
    };

async function _claimGift(session: JWTSession): Promise<ClaimGiftResult> {
  try {
    console.log("🎁 [SERVER] Claiming gift for user:", session.id);

    // Получаем актуальные данные пользователя из БД
    const user = await findUserById(session.id);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    console.log("👤 [SERVER] User onboarding status:", user.onboardingStatus);

    // Подарок можно забрать только если он уже выигран
    if (user.onboardingStatus !== UserOnboardingStatus.GIFT_REVEALED) {
      return {
        success: false,
        error: `Gift is not available for claiming. Current status: ${user.onboardingStatus}`,
      };
    }

    // Получаем незабранные выигрыши пользователя
    const unclaimedDraws = await getUserUnclaimedDraws(session.id);

    if (unclaimedDraws.length === 0) {
      return { success: false, error: "No unclaimed gifts found" };
    }

    const currentDraw = unclaimedDraws[0]; // Берем первый незабранный

    // Получаем все активные задачи
    const tasks = await getActiveLootBoxTasks();

    console.log(`📋 [SERVER] Found ${tasks.length} active tasks`);

    // Если задач нет, считаем что условия онбординга выполнены
    if (tasks.length === 0) {
      console.log(
        "✅ [SERVER] No tasks required - onboarding conditions met automatically"
      );
    } else {
      // Проверяем подписки через наш модуль bot.ts
      const missingSubscriptions: string[] = [];

      console.log(
        "📋 [SERVER] Checking subscriptions for",
        tasks.length,
        "tasks"
      );

      // Проверяем каждую подписку
      for (const task of tasks) {
        try {
          const isMember = await isUserMemberOfChannel(
            session.telegramId.toString(),
            task.channelId
          );

          if (!isMember) {
            console.log(`❌ [SERVER] User not subscribed to ${task.title}`);
            missingSubscriptions.push(task.title);
          } else {
            console.log(`✅ [SERVER] User subscribed to ${task.title}`);
          }
        } catch (error) {
          console.error(
            `❌ [SERVER] Error checking subscription for ${task.channelId}:`,
            error
          );
          missingSubscriptions.push(task.title);
        }
      }

      // Если есть не выполненные подписки
      if (missingSubscriptions.length > 0) {
        console.log("❌ [SERVER] Missing subscriptions:", missingSubscriptions);
        return {
          success: false,
          error: `Please subscribe to all channels first`,
          missingSubscriptions,
        };
      }

      console.log("✅ [SERVER] All subscriptions verified!");
    }

    // Все подписки выполнены - забираем подарок!
    const claimedDraw = await claimLootBoxPrize(currentDraw.id);

    // Обновляем статус онбординга: GIFT_REVEALED -> COMPLETED
    await updateUserOnboardingStatus(
      session.id,
      UserOnboardingStatus.COMPLETED
    );

    console.log(
      "🎉 [SERVER] Gift successfully claimed and onboarding completed!"
    );

    // Обрабатываем реферальную награду после завершения онбординга
    try {
      const referralReward = await processReferralOnboardingReward(
        session.id,
        5,
        5
      );

      if (referralReward) {
        console.log("💰 [SERVER] Referral rewards processed successfully!");

        // Отправляем уведомление рефереру
        const rewardStars = 5;
        const notificationText = `<b>🎉 Новый реферал!</b>\nВы получили бонус в размере <b>${rewardStars} ⭐</b>.`;

        try {
          await sendMessageToUser(
            referralReward.referrer.telegramId,
            notificationText,
            {
              parseMode: "HTML",
            }
          );
        } catch (notificationError) {
          console.error(
            "❌ [SERVER] Failed to send referral notification:",
            notificationError
          );
        }

        // Уведомляем админа
        await notifyAdmin({
          message: `
🎉 <b>Реферальная система сработала!</b>

👥 Реферер: ${referralReward.referrer.telegramId}
👤 Новый пользователь: ${referralReward.referred.telegramId}
💰 Награды начислены: ${rewardStars}⭐ каждому
📅 Время: ${new Date().toLocaleString()}

✅ Онбординг завершен, подарок получен
          `,
          keyboard: "webapp",
          webappButtonText: "📈 Статистика",
          webappUrl: `${process.env.WEBAPP_URL}/admin/referrals`,
        });
      } else {
        console.log("ℹ️ [SERVER] No pending referral found for this user");
      }
    } catch (referralError) {
      console.error(
        "❌ [SERVER] Error processing referral reward:",
        referralError
      );
    }

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
      console.log("🤖 Attempting automatic gift delivery for claimed gift...");

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

        console.log("✅ Automatic delivery of claimed gift successful!");

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
          message: `🎉 Поздравляем! Подарок "${gift.name}" отправлен вам в Telegram!`,
        };
      } catch (autoError: any) {
        console.error(
          "❌ Automatic delivery of claimed gift failed:",
          autoError
        );

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
          message: `🎉 Поздравляем! Вы выиграли "${gift.name}"! Подарок будет отправлен администратором.`,
        };
      }
    } else {
      // Это кастомный подарок, требуется ручная отправка
      console.log(
        "📦 Manual delivery required for claimed gift (no telegramGiftId)"
      );

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
        message: `🎉 Поздравляем! Вы выиграли "${gift.name}"! Подарок будет отправлен администратором.`,
      };
    }
  } catch (error) {
    console.error("💥 [SERVER] Error claiming gift:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to claim gift",
    };
  }
}

export const claimGift = withServerAuth(_claimGift);
