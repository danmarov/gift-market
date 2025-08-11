import { prisma } from "./client";
import { BackdropVariant } from "@prisma/client";

export interface CreateGiftData {
  id: string;
  telegramGiftId?: string;
  name: string;
  description?: string;
  mediaUrl: string;
  price: number;
  quantity: number;
  specialOffer?: boolean;
  backdropVariant?: BackdropVariant;
  tags?: string[];
}

export interface UpdateGiftData {
  name?: string;
  description?: string;
  mediaUrl?: string;
  price?: number;
  quantity?: number;
  specialOffer?: boolean;
  backdropVariant?: BackdropVariant;
  tags?: string[];
}

// Создать новый подарок
export async function createGift(data: CreateGiftData) {
  return prisma.gift.create({
    data: {
      id: data.id,
      telegramGiftId: data.telegramGiftId ?? null,
      name: data.name,
      description: data.description,
      mediaUrl: data.mediaUrl,
      price: data.price,
      quantity: data.quantity,
      specialOffer: data.specialOffer ?? false,
      backdropVariant: data.backdropVariant ?? BackdropVariant.YELLOW,
      tags: data.tags ?? [],
      isDeleted: false, // явно указываем что подарок не удален
    },
  });
}

// Получить подарок по ID (включая удаленные для админов)
export async function findGiftById(
  id: string,
  includeDeleted: boolean = false
) {
  const where: any = { id };

  if (!includeDeleted) {
    where.isDeleted = false;
  }

  return prisma.gift.findUnique({
    where,
  });
}

// Получить подарок по Telegram ID
export async function findGiftByTelegramId(
  telegramGiftId: string,
  includeDeleted: boolean = false
) {
  const where: any = { telegramGiftId };

  if (!includeDeleted) {
    where.isDeleted = false;
  }

  return prisma.gift.findUnique({
    where,
  });
}

// Получить все подарки с пагинацией и фильтрами
export async function findGifts(options?: {
  skip?: number;
  take?: number;
  specialOffer?: boolean;
  tags?: string[];
  backdropVariant?: BackdropVariant;
  available?: boolean; // quantity > soldCount
  includeDeleted?: boolean; // для админов
}) {
  const where: any = {};

  // По умолчанию исключаем удаленные подарки
  if (!options?.includeDeleted) {
    where.isDeleted = false;
  }

  if (options?.specialOffer !== undefined) {
    where.specialOffer = options.specialOffer;
  }

  if (options?.tags && options.tags.length > 0) {
    where.tags = {
      hasSome: options.tags,
    };
  }

  if (options?.backdropVariant) {
    where.backdropVariant = options.backdropVariant;
  }

  if (options?.available) {
    where.quantity = {
      gt: prisma.gift.fields.soldCount,
    };
  }

  return prisma.gift.findMany({
    where,
    skip: options?.skip,
    take: options?.take,
    orderBy: [{ specialOffer: "desc" }, { createdAt: "desc" }],
  });
}

// Обновить подарок
export async function updateGift(id: string, data: UpdateGiftData) {
  return prisma.gift.update({
    where: {
      id,
      isDeleted: false, // можно обновлять только неудаленные подарки
    },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

// МЯГКОЕ удаление подарка
export async function deleteGift(id: string) {
  return prisma.gift.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

// ЖЕСТКОЕ удаление подарка (только для админов)
export async function hardDeleteGift(id: string) {
  return prisma.gift.delete({
    where: { id },
  });
}

// Восстановить удаленный подарок
export async function restoreGift(id: string) {
  return prisma.gift.update({
    where: {
      id,
      isDeleted: true, // можно восстанавливать только удаленные
    },
    data: {
      isDeleted: false,
      deletedAt: null,
      updatedAt: new Date(),
    },
  });
}

// Увеличить счетчик проданных подарков
export async function incrementGiftSoldCount(id: string) {
  return prisma.gift.update({
    where: {
      id,
      isDeleted: false, // только для активных подарков
    },
    data: {
      soldCount: {
        increment: 1,
      },
    },
  });
}

// Получить статистику подарков
export async function getGiftStats() {
  const [total, active, deleted, available, specialOffers, totalSold] =
    await Promise.all([
      // Всего подарков
      prisma.gift.count(),
      // Активных подарков
      prisma.gift.count({
        where: { isDeleted: false },
      }),
      // Удаленных подарков
      prisma.gift.count({
        where: { isDeleted: true },
      }),
      // Доступных для покупки
      prisma.gift.count({
        where: {
          isDeleted: false,
          quantity: {
            gt: prisma.gift.fields.soldCount,
          },
        },
      }),
      // Спец предложения
      prisma.gift.count({
        where: {
          isDeleted: false,
          specialOffer: true,
        },
      }),
      // Всего продано
      prisma.gift.aggregate({
        where: { isDeleted: false },
        _sum: {
          soldCount: true,
        },
      }),
    ]);

  return {
    total,
    active,
    deleted,
    available,
    specialOffers,
    totalSold: totalSold._sum.soldCount || 0,
  };
}

// Получить топ подарков по продажам (только активные)
export async function getTopGiftsBySales(limit = 10) {
  return prisma.gift.findMany({
    where: {
      isDeleted: false,
      soldCount: {
        gt: 0,
      },
    },
    orderBy: {
      soldCount: "desc",
    },
    take: limit,
  });
}

// Поиск подарков по имени (только активные)
export async function searchGiftsByName(
  query: string,
  options?: {
    take?: number;
    excludeIds?: string[];
    includeDeleted?: boolean;
  }
) {
  const where: any = {
    name: {
      contains: query,
      mode: "insensitive",
    },
  };

  if (!options?.includeDeleted) {
    where.isDeleted = false;
  }

  if (options?.excludeIds && options.excludeIds.length > 0) {
    where.id = {
      notIn: options.excludeIds,
    };
  }

  return prisma.gift.findMany({
    where,
    take: options?.take || 10,
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      mediaUrl: true,
      price: true,
      isDeleted: true,
    },
  });
}

// Получить все удаленные подарки (для админки)
export async function getDeletedGifts(options?: {
  skip?: number;
  take?: number;
}) {
  return prisma.gift.findMany({
    where: { isDeleted: true },
    skip: options?.skip,
    take: options?.take,
    orderBy: { deletedAt: "desc" },
  });
}
