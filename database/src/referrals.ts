// database/referrals.ts
import { prisma } from "./client";

export interface CreateReferralData {
  referrerId: string;
  referredId: string;
  reward?: number;
}

// Создать новый реферал
export async function createReferral(data: CreateReferralData) {
  return prisma.referral.create({
    data: {
      referrerId: data.referrerId,
      referredId: data.referredId,
      reward: data.reward ?? 10,
    },
    include: {
      referrer: true,
      referred: true,
    },
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

// Начислить награду за реферала (обновить баланс + создать запись)
export async function processReferralReward(
  referrerId: string,
  referredId: string,
  referrerReward = 10,
  referredReward = 5
) {
  return prisma.$transaction(async (tx) => {
    // Создаем запись о реферале
    const referral = await tx.referral.create({
      data: {
        referrerId,
        referredId,
        reward: referrerReward, // сохраняем награду реферера
      },
    });

    // Начисляем награду рефереру
    await tx.user.update({
      where: { id: referrerId },
      data: {
        balance: { increment: referrerReward },
      },
    });

    // Начисляем бонус новому пользователю
    await tx.user.update({
      where: { id: referredId },
      data: {
        balance: { increment: referredReward },
      },
    });

    return referral;
  });
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
