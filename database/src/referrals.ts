// database/referrals.ts
import { prisma } from "./client";

export interface CreateReferralData {
  referrerId: string;
  referredId: string;
  reward?: number;
}

export interface CreateReferralData {
  referrerId: string;
  referredId: string;
  reward?: number;
}

// Создать новый реферал БЕЗ начисления награды
export async function createReferral(data: CreateReferralData) {
  return prisma.referral.create({
    data: {
      referrerId: data.referrerId,
      referredId: data.referredId,
      reward: 0, // 👈 КЛЮЧЕВОЕ: 0 = награда не начислена, >0 = начислена
    },
    include: {
      referrer: true,
      referred: true,
    },
  });
}

// НОВАЯ ФУНКЦИЯ: Начислить награду за завершение онбординга
export async function processReferralOnboardingReward(
  referredUserId: string,
  referrerReward = 5,
  referredReward = 5
) {
  return prisma.$transaction(async (tx) => {
    // Ищем незавершенный реферал для этого пользователя
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
      return null;
    }

    // Проверяем, не начислена ли уже награда (reward > 0)
    if (referral.reward > 0) {
      console.log(
        `💰 Referral reward already processed for user ${referredUserId}`
      );
      return null;
    }

    console.log(
      `💰 Processing referral reward: ${referral.referrerId} -> ${referredUserId}`
    );

    // Начисляем награду рефереру
    await tx.user.update({
      where: { id: referral.referrerId },
      data: {
        balance: { increment: referrerReward },
      },
    });

    // Начисляем бонус новому пользователю
    await tx.user.update({
      where: { id: referredUserId },
      data: {
        balance: { increment: referredReward },
      },
    });

    // Помечаем реферал как оплаченный, обновляя reward
    const updatedReferral = await tx.referral.update({
      where: { id: referral.id },
      data: {
        reward: referrerReward, // > 0 означает что награда начислена
      },
      include: {
        referrer: true,
        referred: true,
      },
    });

    return updatedReferral;
  });
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

// Получить всех рефералов пользователя
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
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Получить статистику рефералов пользователя
export async function getUserReferralStats(userId: string) {
  const [totalReferrals, totalReward] = await Promise.all([
    prisma.referral.count({
      where: { referrerId: userId },
    }),
    prisma.referral.aggregate({
      where: { referrerId: userId },
      _sum: { reward: true },
    }),
  ]);

  return {
    totalReferrals,
    totalReward: totalReward._sum.reward || 0,
  };
}

// Проверить может ли пользователь быть рефералом (не существует ли уже)
export async function canUserBeReferred(userId: string) {
  const existingReferral = await prisma.referral.findUnique({
    where: { referredId: userId },
  });

  return !existingReferral;
}

// Получить топ рефереров
export async function getTopReferrers(limit = 10) {
  return prisma.user.findMany({
    include: {
      _count: {
        select: {
          referralsGiven: true,
        },
      },
    },
    orderBy: {
      referralsGiven: {
        _count: "desc",
      },
    },
    take: limit,
    where: {
      referralsGiven: {
        some: {},
      },
    },
  });
}
