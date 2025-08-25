// database/referrals.ts
import { prisma } from "./client";

export interface CreateReferralData {
  referrerId: string;
  referredId: string;
  reward?: number;
}

// Создать новый реферал БЕЗ начисления награды и БЕЗ валидации
export async function createReferral(data: CreateReferralData) {
  return prisma.referral.create({
    data: {
      referrerId: data.referrerId,
      referredId: data.referredId,
      reward: 0, // 0 = награда не начислена
      isValidated: false, // новый пользователь еще не подписался на каналы
    },
    include: {
      referrer: true,
      referred: true,
    },
  });
}

export async function validateReferral(referredUserId: string) {
  return prisma.$transaction(async (tx) => {
    // Ищем реферал для этого пользователя
    const referral = await tx.referral.findUnique({
      where: {
        referredId: referredUserId,
      },
      include: {
        referrer: true,
        referred: true,
      },
    });

    if (!referral) {
      console.log(`🔍 No referral found for user ${referredUserId}`);
      return { success: false, data: null };
    }

    // Проверяем, не валидирован ли уже
    if (referral.isValidated) {
      console.log(`✅ Referral already validated for user ${referredUserId}`);
      return { success: true };
    }

    console.log(
      `✅ Validating referral: ${referral.referrerId} -> ${referredUserId}`
    );

    // Помечаем реферал как валидированный
    const updatedReferral = await tx.referral.update({
      where: { id: referral.id },
      data: {
        isValidated: true,
        validatedAt: new Date(),
      },
      include: {
        referrer: true,
        referred: true,
      },
    });

    // Получаем количество ВАЛИДИРОВАННЫХ рефералов у реферера
    const validatedReferralsCount = await tx.referral.count({
      where: {
        referrerId: referral.referrerId,
        isValidated: true,
      },
    });

    console.log(
      `📊 Referrer ${referral.referrerId} has ${validatedReferralsCount} validated referrals`
    );

    // Если это 3+ валидированный реферал - начисляем бонус
    let bonusAwarded = false;
    if (validatedReferralsCount >= 3 && referral.reward === 0) {
      console.log(
        `💰 Awarding bonus for ${validatedReferralsCount}th referral`
      );

      // Начисляем 5 звезд рефереру
      await tx.user.update({
        where: { id: referral.referrerId },
        data: {
          balance: { increment: 5 },
        },
      });

      // Обновляем reward в реферале
      await tx.referral.update({
        where: { id: referral.id },
        data: {
          reward: 5,
        },
      });

      console.log(`💰 Bonus awarded to referrer ${referral.referrerId}`);
      bonusAwarded = true;
    } else {
      console.log(
        `📝 No bonus for referral #${validatedReferralsCount} (bonus starts from 3rd)`
      );
    }

    // Возвращаем telegramId реферера и флаг начисления бонуса
    return {
      success: true,
      telegramId: referral.referrer.telegramId,
      bonusAwarded,
    };
  });
}

// ⭐ НОВАЯ ФУНКЦИЯ: Получить количество валидированных рефералов пользователя
export async function getUserValidatedReferralsCount(userId: string) {
  return prisma.referral.count({
    where: {
      referrerId: userId,
      isValidated: true,
    },
  });
}

// ⭐ НОВАЯ ФУНКЦИЯ: Проверить может ли пользователь забрать подарок (2+ валидированных реферала)
export async function canUserClaimGift(userId: string) {
  const validatedCount = await getUserValidatedReferralsCount(userId);
  return validatedCount >= 2;
}

// Найти реферал по ID приглашенного пользователя
export async function findReferralByReferredId(referredId: string) {
  return prisma.referral.findUnique({
    where: { referredId },
    include: {
      referrer: true,
      referred: true,
    },
  });
}

// Получить всех рефералов пользователя (с информацией о валидации)
export async function getUserReferrals(userId: string) {
  return prisma.referral.findMany({
    where: { referrerId: userId },
    include: {
      referred: {
        select: {
          id: true,
          firstName: true,
          username: true,
          createdAt: true,
          onboardingStatus: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Получить статистику рефералов пользователя (обновленная версия)
export async function getUserReferralStats(userId: string) {
  const [totalReferrals, validatedReferrals, totalReward] = await Promise.all([
    prisma.referral.count({
      where: { referrerId: userId },
    }),
    prisma.referral.count({
      where: {
        referrerId: userId,
        isValidated: true,
      },
    }),
    prisma.referral.aggregate({
      where: { referrerId: userId },
      _sum: { reward: true },
    }),
  ]);

  return {
    totalReferrals,
    validatedReferrals,
    pendingReferrals: totalReferrals - validatedReferrals,
    totalReward: totalReward._sum.reward || 0,
    canClaimGift: validatedReferrals >= 2,
  };
}

// Проверить может ли пользователь быть рефералом (не существует ли уже)
export async function canUserBeReferred(userId: string) {
  const existingReferral = await prisma.referral.findUnique({
    where: { referredId: userId },
  });

  return !existingReferral;
}

// Получить топ рефереров по валидированным рефералам
export async function getTopReferrers(limit = 10) {
  const referrers = await prisma.referral.groupBy({
    by: ["referrerId"],
    where: {
      isValidated: true,
    },
    _count: {
      referredId: true,
    },
    _sum: {
      reward: true,
    },
    orderBy: {
      _count: {
        referredId: "desc",
      },
    },
    take: limit,
  });

  // Получаем данные пользователей
  const userIds = referrers.map((r) => r.referrerId);
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
    },
    select: {
      id: true,
      firstName: true,
      username: true,
    },
  });

  // Соединяем данные
  return referrers.map((referrer) => {
    const user = users.find((u) => u.id === referrer.referrerId);
    return {
      user,
      validatedReferrals: referrer._count.referredId,
      totalReward: referrer._sum.reward || 0,
    };
  });
}
