// database/onboarding.ts (новый файл или добавить в users.ts)
import { prisma } from "./client";
import { UserOnboardingStatus } from "@prisma/client";
import { validateReferral, getUserValidatedReferralsCount } from "./referrals";

// ⭐ НОВАЯ ФУНКЦИЯ: Обработать подписку на каналы
export async function processChannelSubscriptionComplete(userId: string) {
  return prisma.$transaction(async (tx) => {
    // Получаем пользователя
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Проверяем текущий статус
    if (user.onboardingStatus !== UserOnboardingStatus.GIFT_REVEALED) {
      throw new Error(
        `Cannot complete channels for user with status: ${user.onboardingStatus}`
      );
    }

    // Обновляем статус пользователя на CHANNELS_COMPLETED
    await tx.user.update({
      where: { id: userId },
      data: {
        onboardingStatus: UserOnboardingStatus.CHANNELS_COMPLETED,
      },
    });

    console.log(`✅ User ${userId} completed channel subscriptions`);

    // ⭐ ВАЛИДИРУЕМ РЕФЕРАЛ (если пользователь был приглашен)
    // Это нужно вынести в отдельную транзакцию, чтобы не блокировать основную логику
    setTimeout(async () => {
      try {
        const validatedReferral = await validateReferral(userId);
        if (validatedReferral) {
          console.log(`✅ Referral validated for user ${userId}`);

          // ⭐ ОТПРАВЛЯЕМ УВЕДОМЛЕНИЕ РЕФЕРЕРУ
          // Это можно вынести в отдельный сервис уведомлений
          await notifyReferrerAboutNewReferral(validatedReferral);
        }
      } catch (error) {
        console.error("Error validating referral:", error);
      }
    }, 100);

    return user;
  });
}

// ⭐ НОВАЯ ФУНКЦИЯ: Проверить может ли пользователь забрать подарок
export async function canUserClaimOnboardingGift(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { canClaim: false, reason: "User not found" };
  }

  // Проверяем статус онбординга
  if (user.onboardingStatus !== UserOnboardingStatus.CHANNELS_COMPLETED) {
    return {
      canClaim: false,
      reason: `Invalid onboarding status: ${user.onboardingStatus}`,
    };
  }

  // Проверяем количество валидированных рефералов
  const validatedReferralsCount = await getUserValidatedReferralsCount(userId);

  if (validatedReferralsCount < 2) {
    return {
      canClaim: false,
      reason: `Not enough referrals: ${validatedReferralsCount}/2`,
      currentReferrals: validatedReferralsCount,
      requiredReferrals: 2,
    };
  }

  return {
    canClaim: true,
    currentReferrals: validatedReferralsCount,
    requiredReferrals: 2,
  };
}

// ⭐ НОВАЯ ФУНКЦИЯ: Завершить онбординг (забрать подарок)
export async function completeOnboarding(userId: string) {
  return prisma.$transaction(async (tx) => {
    // Проверяем может ли забрать подарок
    const claimCheck = await canUserClaimOnboardingGift(userId);

    if (!claimCheck.canClaim) {
      throw new Error(claimCheck.reason);
    }

    // Обновляем статус на COMPLETED
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        onboardingStatus: UserOnboardingStatus.COMPLETED,
      },
    });

    console.log(`🎉 User ${userId} completed onboarding!`);

    return updatedUser;
  });
}

// ⭐ ФУНКЦИЯ: Пропустить получение подарка (перейти на главную)
export async function skipOnboardingGift(userId: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Можно пропустить только если подписался на каналы
    if (user.onboardingStatus !== UserOnboardingStatus.CHANNELS_COMPLETED) {
      throw new Error(`Cannot skip from status: ${user.onboardingStatus}`);
    }

    // Пока оставляем статус CHANNELS_COMPLETED
    // Пользователь сможет вернуться и забрать подарок позже
    console.log(`⏭️ User ${userId} skipped onboarding gift`);

    return user;
  });
}

// ⭐ ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: Уведомить реферера о новом реферале
async function notifyReferrerAboutNewReferral(referral: any) {
  // Здесь будет логика отправки уведомления через Telegram Bot
  // Пока просто логируем
  console.log(
    `📢 Should notify referrer ${referral.referrerId} about new referral ${referral.referredId}`
  );

  // TODO: Интегрировать с Telegram Bot API
  // Например:
  // await bot.api.sendMessage(referral.referrer.telegramId,
  //   `🎉 У вас новый реферал! ${referral.referred.firstName || 'Пользователь'} подписался на каналы.`
  // );
}

// ⭐ ПОЛУЧИТЬ СТАТУС ОНБОРДИНГА С ДОПОЛНИТЕЛЬНОЙ ИНФОРМАЦИЕЙ
export async function getOnboardingStatusWithDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const validatedReferralsCount = await getUserValidatedReferralsCount(userId);
  const canClaimGift = await canUserClaimOnboardingGift(userId);

  return {
    onboardingStatus: user.onboardingStatus,
    referrals: {
      current: validatedReferralsCount,
      required: 2,
      canProceed: validatedReferralsCount >= 2,
    },
    canClaimGift: canClaimGift.canClaim,
    canSkip: user.onboardingStatus === UserOnboardingStatus.CHANNELS_COMPLETED,
  };
}
