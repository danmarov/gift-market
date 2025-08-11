// database/src/demo-prize.ts
import { prisma } from "./client";

// ===== DEMO PRIZES =====

export interface CreateDemoPrizeData {
  name: string;
  description?: string;
  mediaUrl: string;
  isActive?: boolean;
  cloudinaryPublicId?: string; // добавить
}

export interface UpdateDemoPrizeData {
  name?: string;
  description?: string;
  mediaUrl?: string;
  isActive?: boolean;
  cloudinaryPublicId?: string; // добавить
}

// Создать новый демо-приз
export async function createDemoPrize(data: CreateDemoPrizeData) {
  return prisma.demoPrize.create({
    data: {
      name: data.name,
      description: data.description ?? "",
      mediaUrl: data.mediaUrl,
      cloudinaryPublicId: data.cloudinaryPublicId,
      isActive: data.isActive ?? true,
    },
  });
}

// Получить все демо-призы
export async function getAllDemoPrizes() {
  return prisma.demoPrize.findMany({
    orderBy: [
      { isActive: "desc" }, // Активные сначала
      { createdAt: "desc" }, // Новые сначала
    ],
  });
}

// Получить только активные демо-призы
export async function getActiveDemoPrizes() {
  return prisma.demoPrize.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// Получить демо-приз по ID
export async function findDemoPrizeById(id: number) {
  return prisma.demoPrize.findUnique({
    where: { id },
  });
}

// Обновить демо-приз
export async function updateDemoPrize(id: number, data: UpdateDemoPrizeData) {
  return prisma.demoPrize.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

// Удалить демо-приз
export async function deleteDemoPrize(id: number) {
  return prisma.demoPrize.delete({
    where: { id },
  });
}

// Деактивировать демо-приз (мягкое удаление)
export async function deactivateDemoPrize(id: number) {
  return updateDemoPrize(id, { isActive: false });
}

// Активировать демо-приз
export async function activateDemoPrize(id: number) {
  return updateDemoPrize(id, { isActive: true });
}

// ===== СТАТИСТИКА =====

// Получить количество демо-призов
export async function getDemoPrizesCount() {
  const [total, active] = await Promise.all([
    prisma.demoPrize.count(),
    prisma.demoPrize.count({
      where: { isActive: true },
    }),
  ]);

  return {
    total,
    active,
    inactive: total - active,
  };
}

// Получить последние добавленные демо-призы
export async function getRecentDemoPrizes(limit = 10) {
  return prisma.demoPrize.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
