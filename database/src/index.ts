// database/src/index.ts
import { UserOnboardingStatus } from "@prisma/client";
import { prisma } from "./client";

export { prisma };
export * from "@prisma/client";

export async function findUserByTelegramId(telegramId: string) {
  return prisma.user.findUnique({
    where: { telegramId },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createOrUpdateUser(data: {
  telegramId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
}) {
  return prisma.user.upsert({
    where: { telegramId: data.telegramId },
    create: {
      telegramId: data.telegramId,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      photoUrl: data.photoUrl,
      lastActivity: new Date(),
    },
    update: {
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      photoUrl: data.photoUrl,
      lastActivity: new Date(),
    },
  });
}
export async function updateUserRole(
  telegramId: string,
  role: "ADMIN" | "USER"
) {
  return prisma.user.update({
    where: { telegramId },
    data: { role },
  });
}

export async function updateUserWebActivity(telegramId: string) {
  return prisma.user.update({
    where: { telegramId },
    data: {
      lastActivity: new Date(),
    },
  });
}

export async function updateUserOnboardingStatus(
  userId: string,
  status: UserOnboardingStatus
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      onboardingStatus: status,
      updatedAt: new Date(),
    },
  });
}

export async function getUserWonGift(userId: string) {
  const wonDraw = await prisma.lootBoxDraw.findFirst({
    where: {
      userId,
      status: {
        in: ["WON", "CLAIMED"],
      },
    },
    include: {
      prize: {
        include: {
          gift: true,
        },
      },
    },
    orderBy: {
      wonAt: "desc",
    },
  });

  return wonDraw;
}

export * from "./gift";
export * from "./referrals";
export * from "./tasks";
export * from "./purchase";
export * from "./lootbox";
export * from "./demo-prize";
