// database/src/purchases.ts
import { prisma } from "./client";
import { PurchaseStatus } from "@prisma/client";

export interface CreatePurchaseData {
  buyerId: string;
  giftId: string;
  quantity: number;
  totalPrice: number;
  pricePerItem: number;
  adminNotes?: string;
}

export interface UpdatePurchaseData {
  status?: PurchaseStatus;
  adminNotes?: string;
  sentAt?: Date;
  telegramMessageId?: number;
}

// database/src/purchases.ts
export async function createPurchase(data: CreatePurchaseData) {
  console.log("🔍 Starting createPurchase with data:", data);
  console.log("🔍 Prisma client:", !!prisma);
  console.log("🔍 Available models:", Object.keys(prisma));
  return prisma.$transaction(async (tx) => {
    console.log("🔍 Transaction started, tx:", !!tx);
    console.log("🔍 tx.purchase:", !!tx.purchase);
    // Проверяем что подарок существует и доступен
    const gift = await tx.gift.findUnique({
      where: { id: data.giftId },
    });

    if (!gift) {
      throw new Error("Gift not found");
    }

    if (gift.quantity < data.quantity) {
      throw new Error("Insufficient gift quantity");
    }

    // Проверяем баланс пользователя
    const user = await tx.user.findUnique({
      where: { id: data.buyerId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.balance < data.totalPrice) {
      throw new Error("Insufficient balance");
    }

    // Списываем звезды с баланса
    await tx.user.update({
      where: { id: data.buyerId },
      data: {
        balance: {
          decrement: data.totalPrice,
        },
      },
    });

    // Уменьшаем количество подарков
    await tx.gift.update({
      where: { id: data.giftId },
      data: {
        quantity: {
          decrement: data.quantity,
        },
        soldCount: {
          increment: data.quantity,
        },
      },
    });

    // Создаем покупку - ИСПРАВЛЯЕМ ЗДЕСЬ
    return tx.purchase.create({
      // Было: prisma.purchase.create
      data: {
        buyerId: data.buyerId,
        giftId: data.giftId,
        quantity: data.quantity,
        totalPrice: data.totalPrice,
        pricePerItem: data.pricePerItem,
        adminNotes: data.adminNotes,
        status: PurchaseStatus.PENDING,
      },
      include: {
        buyer: {
          select: {
            firstName: true,
            username: true,
            telegramId: true,
          },
        },
        gift: {
          select: {
            name: true,
            mediaUrl: true,
            telegramGiftId: true,
          },
        },
      },
    });
  });
}

// Получить покупку по ID
export async function findPurchaseById(id: number) {
  return prisma.purchase.findUnique({
    where: { id },
    include: {
      buyer: {
        select: {
          firstName: true,
          username: true,
          telegramId: true,
        },
      },
      gift: {
        select: {
          name: true,
          mediaUrl: true,
          telegramGiftId: true,
        },
      },
    },
  });
}

// Получить покупки с фильтрами
export async function findPurchases(options?: {
  skip?: number;
  take?: number;
  status?: PurchaseStatus;
  buyerId?: string;
  giftId?: string;
  orderBy?: "createdAt" | "updatedAt" | "sentAt";
  orderDir?: "asc" | "desc";
}) {
  const where: any = {};

  if (options?.status) {
    where.status = options.status;
  }

  if (options?.buyerId) {
    where.buyerId = options.buyerId;
  }

  if (options?.giftId) {
    where.giftId = options.giftId;
  }

  const orderBy = options?.orderBy || "createdAt";
  const orderDir = options?.orderDir || "desc";

  return prisma.purchase.findMany({
    where,
    skip: options?.skip,
    take: options?.take,
    orderBy: {
      [orderBy]: orderDir,
    },
    include: {
      buyer: {
        select: {
          firstName: true,
          username: true,
          telegramId: true,
        },
      },
      gift: {
        select: {
          name: true,
          mediaUrl: true,
          telegramGiftId: true,
        },
      },
    },
  });
}

// Получить покупки по статусам для админки
export async function getPurchasesByStatus() {
  const [pending, sent, cancelled] = await Promise.all([
    prisma.purchase.findMany({
      where: { status: PurchaseStatus.PENDING },
      include: {
        buyer: {
          select: {
            firstName: true,
            username: true,
            telegramId: true,
          },
        },
        gift: {
          select: {
            name: true,
            mediaUrl: true,
            telegramGiftId: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.purchase.findMany({
      where: { status: PurchaseStatus.SENT },
      include: {
        buyer: {
          select: {
            firstName: true,
            username: true,
            telegramId: true,
          },
        },
        gift: {
          select: {
            name: true,
            mediaUrl: true,
            telegramGiftId: true,
          },
        },
      },
      orderBy: { sentAt: "desc" },
    }),
    prisma.purchase.findMany({
      where: { status: PurchaseStatus.CANCELLED },
      include: {
        buyer: {
          select: {
            firstName: true,
            username: true,
            telegramId: true,
          },
        },
        gift: {
          select: {
            name: true,
            mediaUrl: true,
            telegramGiftId: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return {
    pending,
    history: [...sent, ...cancelled].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ),
  };
}

// Обновить покупку
export async function updatePurchase(id: number, data: UpdatePurchaseData) {
  return prisma.purchase.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    include: {
      buyer: {
        select: {
          firstName: true,
          username: true,
          telegramId: true,
        },
      },
      gift: {
        select: {
          name: true,
          mediaUrl: true,
          telegramGiftId: true,
        },
      },
    },
  });
}

// Отметить как отправленный
export async function markPurchaseAsSent(
  id: number,
  telegramMessageId?: number,
  adminNotes?: string
) {
  return updatePurchase(id, {
    status: PurchaseStatus.SENT,
    sentAt: new Date(),
    telegramMessageId,
    adminNotes,
  });
}

// Отменить покупку с возвратом средств
export async function cancelPurchase(id: number, adminNotes?: string) {
  return prisma.$transaction(async (tx) => {
    // Получаем покупку
    const purchase = await tx.purchase.findUnique({
      where: { id },
      include: { gift: true },
    });

    if (!purchase) {
      throw new Error("Purchase not found");
    }

    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new Error("Can only cancel pending purchases");
    }

    // Возвращаем звезды пользователю
    await tx.user.update({
      where: { id: purchase.buyerId },
      data: {
        balance: {
          increment: purchase.totalPrice,
        },
      },
    });

    // Возвращаем количество подарков
    await tx.gift.update({
      where: { id: purchase.giftId },
      data: {
        quantity: {
          increment: purchase.quantity,
        },
        soldCount: {
          decrement: purchase.quantity,
        },
      },
    });

    // Обновляем статус покупки
    return tx.purchase.update({
      where: { id },
      data: {
        status: PurchaseStatus.CANCELLED,
        adminNotes,
        updatedAt: new Date(),
      },
      include: {
        buyer: {
          select: {
            firstName: true,
            username: true,
            telegramId: true,
          },
        },
        gift: {
          select: {
            name: true,
            mediaUrl: true,
            telegramGiftId: true,
          },
        },
      },
    });
  });
}

// Получить покупки пользователя
export async function getUserPurchases(userId: string) {
  return prisma.purchase.findMany({
    where: { buyerId: userId },
    include: {
      gift: {
        select: {
          name: true,
          mediaUrl: true,
          telegramGiftId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Получить статистику покупок
export async function getPurchaseStats() {
  const [total, pending, sent, cancelled, totalRevenue] = await Promise.all([
    prisma.purchase.count(),
    prisma.purchase.count({
      where: { status: PurchaseStatus.PENDING },
    }),
    prisma.purchase.count({
      where: { status: PurchaseStatus.SENT },
    }),
    prisma.purchase.count({
      where: { status: PurchaseStatus.CANCELLED },
    }),
    prisma.purchase.aggregate({
      where: { status: { in: [PurchaseStatus.SENT] } },
      _sum: {
        totalPrice: true,
      },
    }),
  ]);

  return {
    total,
    pending,
    sent,
    cancelled,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
  };
}

// Получить топ покупателей
export async function getTopBuyers(limit = 10) {
  return prisma.purchase.groupBy({
    by: ["buyerId"],
    where: {
      status: { in: [PurchaseStatus.SENT] },
    },
    _sum: {
      totalPrice: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        totalPrice: "desc",
      },
    },
    take: limit,
  });
}

// Добавляем к существующим методам в purchases.ts

// Специально для админки - пагинация по табам
export async function getPendingPurchases(options?: {
  cursor?: string; // ID последней загруженной покупки
  limit?: number;
}) {
  const limit = options?.limit || 20;

  const where: any = {
    status: PurchaseStatus.PENDING,
  };

  // Cursor-based пагинация (более стабильная для realtime данных)
  if (options?.cursor) {
    where.id = {
      lt: parseInt(options.cursor, 10),
    };
  }

  const purchases = await prisma.purchase.findMany({
    where,
    take: limit + 1, // +1 чтобы понять есть ли еще данные
    orderBy: { createdAt: "asc" }, // старые заказы в приоритете
    include: {
      buyer: {
        select: {
          firstName: true,
          username: true,
          telegramId: true,
        },
      },
      gift: {
        select: {
          name: true,
          mediaUrl: true,
          telegramGiftId: true,
        },
      },
    },
  });

  const hasMore = purchases.length > limit;
  const items = hasMore ? purchases.slice(0, -1) : purchases;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  return {
    items,
    hasMore,
    nextCursor,
    total: await prisma.purchase.count({
      where: { status: PurchaseStatus.PENDING },
    }),
  };
}

export async function getHistoryPurchases(options?: {
  cursor?: string;
  limit?: number;
}) {
  const limit = options?.limit || 20;

  const where: any = {
    status: {
      in: [PurchaseStatus.SENT, PurchaseStatus.CANCELLED],
    },
  };

  if (options?.cursor) {
    where.id = {
      lt: parseInt(options.cursor, 10),
    };
  }

  const purchases = await prisma.purchase.findMany({
    where,
    take: limit + 1,
    orderBy: { updatedAt: "desc" }, // новые обновления сверху
    include: {
      buyer: {
        select: {
          firstName: true,
          username: true,
          telegramId: true,
        },
      },
      gift: {
        select: {
          name: true,
          mediaUrl: true,
          telegramGiftId: true,
        },
      },
    },
  });

  const hasMore = purchases.length > limit;
  const items = hasMore ? purchases.slice(0, -1) : purchases;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  return {
    items,
    hasMore,
    nextCursor,
    total: await prisma.purchase.count({
      where: {
        status: { in: [PurchaseStatus.SENT, PurchaseStatus.CANCELLED] },
      },
    }),
  };
}

// Универсальный метод для любой пагинации
export async function getPurchasesPaginated(options: {
  status?: PurchaseStatus | PurchaseStatus[];
  cursor?: string;
  limit?: number;
  orderBy?: "createdAt" | "updatedAt" | "sentAt";
  orderDir?: "asc" | "desc";
}) {
  const limit = options.limit || 20;
  const orderBy = options.orderBy || "createdAt";
  const orderDir = options.orderDir || "desc";

  const where: any = {};

  if (options.status) {
    where.status = Array.isArray(options.status)
      ? { in: options.status }
      : options.status;
  }

  if (options.cursor) {
    where.id = {
      [orderDir === "desc" ? "lt" : "gt"]: options.cursor,
    };
  }

  const purchases = await prisma.purchase.findMany({
    where,
    take: limit + 1,
    orderBy: { [orderBy]: orderDir },
    include: {
      buyer: {
        select: {
          firstName: true,
          username: true,
          telegramId: true,
        },
      },
      gift: {
        select: {
          name: true,
          mediaUrl: true,
          telegramGiftId: true,
        },
      },
    },
  });

  const hasMore = purchases.length > limit;
  const items = hasMore ? purchases.slice(0, -1) : purchases;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  return {
    items,
    hasMore,
    nextCursor,
  };
}
