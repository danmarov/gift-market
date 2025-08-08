"use server";
import {
  getActiveLootBoxTasks,
  updateUserOnboardingStatus,
  getUserUnclaimedDraws,
  claimLootBoxPrize,
  findUserById,
  UserOnboardingStatus,
  createPurchase as createPurchaseDb,
} from "database";
import { JWTSession } from "@/lib/types/session";
import { withServerAuth } from "../auth/with-server-auth";
import { isUserMemberOfChannel, notifyAdmin } from "../bot";

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

    if (tasks.length === 0) {
      return { success: false, error: "No active tasks found" };
    }

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

    await createPurchaseDb({
      buyerId: session.id,
      giftId: claimedDraw.prize.gift.id,
      quantity: 1,
      totalPrice: 0,
      pricePerItem: 0,
    });
    await notifyAdmin({
      message: `
🎉 <b>Новый выигрыш подарка!</b>

👤 Пользователь: ${session.telegramId}
🎁 Подарок: ${claimedDraw.prize.gift.name} (x${1})
💰 Стоимость: Бесплатно
📅 Время: ${new Date().toLocaleString()}

✅ Все задачи выполнены
  `,
      keyboard: "webapp",
      webappButtonText: "📈 Открыть ордера",
      webappUrl: `${process.env.WEBAPP_URL}/admin/orders`,
    });
    return {
      success: true,
      message: `Congratulations! You have successfully claimed: ${claimedDraw.prize.gift.name}`,
    };
  } catch (error) {
    console.error("💥 [SERVER] Error claiming gift:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to claim gift",
    };
  }
}

export const claimGift = withServerAuth(_claimGift);
