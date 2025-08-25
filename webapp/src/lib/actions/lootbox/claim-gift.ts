"use server";
import {
  getActiveLootBoxTasks,
  updateUserOnboardingStatus,
  getUserUnclaimedDraws,
  claimLootBoxPrize,
  findUserById,
  UserOnboardingStatus,
  getUserValidatedReferralsCount,
} from "database";
import { JWTSession } from "@/lib/types/session";
import { withServerAuth } from "../auth/with-server-auth";
import { isUserMemberOfChannel } from "../bot";
import { revalidatePath } from "next/cache";

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

    // Подарок можно проверить только если статус GIFT_REVEALED или CHANNELS_COMPLETED
    if (
      user.onboardingStatus !== UserOnboardingStatus.GIFT_REVEALED &&
      user.onboardingStatus !== UserOnboardingStatus.CHANNELS_COMPLETED
    ) {
      return {
        success: false,
        error: `Gift is not available for claiming. Current status: ${user.onboardingStatus}`,
      };
    }

    // Проверяем количество подтвержденных рефералов
    const validatedReferrals = await getUserValidatedReferralsCount(session.id);
    console.log(
      `📊 [SERVER] User has ${validatedReferrals} validated referrals`
    );

    // Получаем все активные задачи
    const tasks = await getActiveLootBoxTasks();
    console.log(`📋 [SERVER] Found ${tasks.length} active tasks`);

    // Проверяем подписки
    let allSubscriptionsMet = true;
    const missingSubscriptions: string[] = [];

    if (tasks.length > 0) {
      console.log(
        "📋 [SERVER] Checking subscriptions for",
        tasks.length,
        "tasks"
      );

      for (const task of tasks) {
        try {
          const isMember = await isUserMemberOfChannel(
            session.telegramId.toString(),
            task.channelId
          );

          if (!isMember) {
            console.log(`❌ [SERVER] User not subscribed to ${task.title}`);
            missingSubscriptions.push(task.title);
            allSubscriptionsMet = false;
          } else {
            console.log(`✅ [SERVER] User subscribed to ${task.title}`);
          }
        } catch (error) {
          console.error(
            `❌ [SERVER] Error checking subscription for ${task.channelId}:`,
            error
          );
          missingSubscriptions.push(task.title);
          allSubscriptionsMet = false;
        }
      }
    } else {
      console.log(
        "✅ [SERVER] No tasks required - subscription conditions met automatically"
      );
    }

    // Если подписки выполнены, но рефералов меньше 2
    if (allSubscriptionsMet && validatedReferrals < 2) {
      console.log(
        `❌ [SERVER] Not enough validated referrals: ${validatedReferrals}/2`
      );
      // Обновляем статус на CHANNELS_COMPLETED только если еще не установлен
      if (user.onboardingStatus !== UserOnboardingStatus.CHANNELS_COMPLETED) {
        await updateUserOnboardingStatus(
          session.id,
          UserOnboardingStatus.CHANNELS_COMPLETED
        );
      }
      return {
        success: false,
        error: `Пригласите 2 друзей для получения подарка`,
      };
    }

    // Если есть неподписанные каналы
    if (!allSubscriptionsMet) {
      console.log("❌ [SERVER] Missing subscriptions:", missingSubscriptions);
      return {
        success: false,
        error: `Сначала подпишитесь на все каналы`,
        missingSubscriptions,
      };
    }

    const unclaimedDraws = await getUserUnclaimedDraws(session.id);

    if (unclaimedDraws.length === 0) {
      return { success: false, error: "No unclaimed gifts found" };
    }

    const currentDraw = unclaimedDraws[0];
    const claimedDraw = await claimLootBoxPrize(currentDraw.id);

    await updateUserOnboardingStatus(
      session.id,
      UserOnboardingStatus.ALL_COMPLETED
    );

    console.log(
      "🎉 [SERVER] All conditions met, setting status to ALL_COMPLETED for animation!"
    );

    const gift = claimedDraw.prize.gift;
    revalidatePath("/onboarding");
    return {
      success: true,
      message: `🎉 Поздравляем! Вы выиграли "${gift.name}"! Нажмите "Забрать", чтобы получить подарок.`,
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
