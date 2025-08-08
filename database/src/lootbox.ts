// database/src/lootbox.ts
import { prisma } from "./client";
import { LootBoxDrawStatus } from "@prisma/client";

// ===== LOOT BOX PRIZES =====

export interface CreateLootBoxPrizeData {
  giftId: string;
  dropChance: number; // 0.01 = 1%
  maxWins?: number;
  isActive?: boolean;
  color: string;
}

export interface UpdateLootBoxPrizeData {
  dropChance?: number;
  maxWins?: number;
  isActive?: boolean;
  color?: string;
}

// Создать новый приз для розыгрыша
export async function createLootBoxPrize(data: CreateLootBoxPrizeData) {
  return prisma.lootBoxPrize.create({
    data: {
      giftId: data.giftId,
      dropChance: data.dropChance,
      maxWins: data.maxWins,
      isActive: data.isActive ?? true,
      color: data.color ?? "#FF6B6B",
    },
    include: {
      gift: true,
    },
  });
}

// Получить все активные призы для розыгрыша
export async function getActiveLootBoxPrizes() {
  return prisma.lootBoxPrize.findMany({
    where: {
      isActive: true,
      // Проверяем что лимит не исчерпан
      OR: [
        { maxWins: null }, // без лимита
        {
          maxWins: { gt: prisma.lootBoxPrize.fields.currentWins },
        },
      ],
    },
    include: {
      gift: true,
    },
    orderBy: {
      dropChance: "desc",
    },
  });
}

export async function getAllLootBoxPrizes() {
  return prisma.lootBoxPrize.findMany({
    include: {
      gift: true,
    },
    orderBy: [{ isActive: "desc" }, { dropChance: "desc" }],
  });
}

// Получить приз по ID
export async function findLootBoxPrizeById(id: string) {
  return prisma.lootBoxPrize.findUnique({
    where: { id },
    include: {
      gift: true,
      draws: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              username: true,
            },
          },
        },
      },
    },
  });
}

export async function updateLootBoxPrize(
  id: string,
  data: UpdateLootBoxPrizeData
) {
  return prisma.lootBoxPrize.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    include: {
      gift: true,
    },
  });
}

// Удалить приз
export async function deleteLootBoxPrize(id: string) {
  return prisma.lootBoxPrize.delete({
    where: { id },
  });
}

// Увеличить счетчик выигрышей приза
export async function incrementPrizeWinCount(prizeId: string) {
  return prisma.lootBoxPrize.update({
    where: { id: prizeId },
    data: {
      currentWins: {
        increment: 1,
      },
    },
  });
}

// ===== LOOT BOX DRAWS =====

export interface CreateLootBoxDrawData {
  userId: string;
  prizeId: string;
}

// Провести розыгрыш (основная логика)
export async function conductLootBoxDraw(userId: string) {
  return prisma.$transaction(async (tx) => {
    // Получаем активные призы
    const prizes = await tx.lootBoxPrize.findMany({
      where: {
        isActive: true,
        OR: [
          { maxWins: null },
          {
            maxWins: { gt: tx.lootBoxPrize.fields.currentWins },
          },
        ],
      },
      include: {
        gift: true,
      },
    });

    if (prizes.length === 0) {
      throw new Error("No prizes available for draw");
    }

    // Нормализуем шансы (сумма должна быть <= 1)
    const totalChance = prizes.reduce(
      (sum, prize) => sum + prize.dropChance,
      0
    );
    if (totalChance > 1) {
      throw new Error("Total drop chance exceeds 100%");
    }

    // Генерируем случайное число
    const random = Math.random();
    let currentChance = 0;
    let selectedPrize = null;

    // Выбираем приз по шансам
    for (const prize of prizes) {
      currentChance += prize.dropChance;
      if (random <= currentChance) {
        selectedPrize = prize;
        break;
      }
    }

    // Если ничего не выпало - берем последний приз (fallback)
    if (!selectedPrize) {
      selectedPrize = prizes[prizes.length - 1];
    }

    // Создаем запись о выигрыше
    const draw = await tx.lootBoxDraw.create({
      data: {
        userId,
        prizeId: selectedPrize.id,
        status: LootBoxDrawStatus.WON,
      },
      include: {
        prize: {
          include: {
            gift: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            username: true,
          },
        },
      },
    });

    // Увеличиваем счетчик выигрышей
    await tx.lootBoxPrize.update({
      where: { id: selectedPrize.id },
      data: {
        currentWins: {
          increment: 1,
        },
      },
    });

    return draw;
  });
}

// Создать выигрыш вручную (для админа)
export async function createLootBoxDraw(data: CreateLootBoxDrawData) {
  return prisma.lootBoxDraw.create({
    data: {
      userId: data.userId,
      prizeId: data.prizeId,
      status: LootBoxDrawStatus.WON,
    },
    include: {
      prize: {
        include: {
          gift: true,
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          username: true,
        },
      },
    },
  });
}

// Получить выигрыш по ID
export async function findLootBoxDrawById(id: string) {
  return prisma.lootBoxDraw.findUnique({
    where: { id },
    include: {
      prize: {
        include: {
          gift: true,
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          username: true,
        },
      },
    },
  });
}

// Получить все выигрыши пользователя
export async function getUserLootBoxDraws(userId: string) {
  return prisma.lootBoxDraw.findMany({
    where: { userId },
    include: {
      prize: {
        include: {
          gift: true,
        },
      },
    },
    orderBy: { wonAt: "desc" },
  });
}

// Получить незабранные выигрыши пользователя
export async function getUserUnclaimedDraws(userId: string) {
  return prisma.lootBoxDraw.findMany({
    where: {
      userId,
      status: LootBoxDrawStatus.WON,
    },
    include: {
      prize: {
        include: {
          gift: true,
        },
      },
    },
    orderBy: { wonAt: "desc" },
  });
}

// Забрать приз (изменить статус на CLAIMED)
export async function claimLootBoxPrize(drawId: string) {
  return prisma.$transaction(async (tx) => {
    const draw = await tx.lootBoxDraw.findUnique({
      where: { id: drawId },
      include: {
        prize: {
          include: {
            gift: true,
          },
        },
      },
    });

    if (!draw) {
      throw new Error("Draw not found");
    }

    if (draw.status !== LootBoxDrawStatus.WON) {
      throw new Error(`Cannot claim prize. Status: ${draw.status}`);
    }

    return tx.lootBoxDraw.update({
      where: { id: drawId },
      data: {
        status: LootBoxDrawStatus.CLAIMED,
        claimedAt: new Date(),
      },
      include: {
        prize: {
          include: {
            gift: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            username: true,
          },
        },
      },
    });
  });
}

// ===== LOOT BOX TASKS =====

export interface CreateLootBoxTaskData {
  title: string;
  description?: string;
  icon?: string;
  channelId: string;
  chatId?: string;
  channelUrl: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateLootBoxTaskData {
  title?: string;
  description?: string;
  icon?: string;
  channelId?: string;
  chatId?: string;
  channelUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// Создать новую задачу для loot box
export async function createLootBoxTask(data: CreateLootBoxTaskData) {
  return prisma.lootBoxTask.create({
    data: {
      title: data.title,
      description: data.description,
      icon: data.icon ?? "telegram",
      channelId: data.channelId,
      chatId: data.chatId,
      channelUrl: data.channelUrl,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  });
}

// Получить все активные задачи для loot box
export async function getActiveLootBoxTasks() {
  return prisma.lootBoxTask.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}

export async function getAllLootBoxTasks() {
  return prisma.lootBoxTask.findMany({
    orderBy: [
      { isActive: "desc" }, // Активные сначала
      { sortOrder: "asc" }, // Потом по порядку сортировки
      { createdAt: "desc" }, // Новые сначала
    ],
  });
}

// Получить задачу по ID
export async function findLootBoxTaskById(id: string) {
  return prisma.lootBoxTask.findUnique({
    where: { id },
  });
}

// Обновить задачу
export async function updateLootBoxTask(
  id: string,
  data: UpdateLootBoxTaskData
) {
  return prisma.lootBoxTask.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

// Удалить задачу
export async function deleteLootBoxTask(id: string) {
  return prisma.lootBoxTask.delete({
    where: { id },
  });
}

// Деактивировать задачу
export async function deactivateLootBoxTask(id: string) {
  return updateLootBoxTask(id, { isActive: false });
}

// ===== СТАТИСТИКА =====

// Получить общую статистику розыгрышей
export async function getLootBoxStats() {
  const [totalDraws, claimedDraws, activePrizes, totalTasks] =
    await Promise.all([
      prisma.lootBoxDraw.count(),
      prisma.lootBoxDraw.count({
        where: { status: LootBoxDrawStatus.CLAIMED },
      }),
      prisma.lootBoxPrize.count({
        where: { isActive: true },
      }),
      prisma.lootBoxTask.count({
        where: { isActive: true },
      }),
    ]);

  return {
    totalDraws,
    claimedDraws,
    unclaimedDraws: totalDraws - claimedDraws,
    claimRate: totalDraws > 0 ? (claimedDraws / totalDraws) * 100 : 0,
    activePrizes,
    totalTasks,
  };
}

// Получить топ призов по выигрышам
export async function getTopPrizesByWins(limit = 10) {
  return prisma.lootBoxPrize.findMany({
    where: {
      currentWins: { gt: 0 },
    },
    include: {
      gift: true,
    },
    orderBy: {
      currentWins: "desc",
    },
    take: limit,
  });
}

// Получить последние выигрыши (для админки)
export async function getRecentDraws(limit = 20) {
  return prisma.lootBoxDraw.findMany({
    include: {
      prize: {
        include: {
          gift: true,
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          username: true,
        },
      },
    },
    orderBy: { wonAt: "desc" },
    take: limit,
  });
}
