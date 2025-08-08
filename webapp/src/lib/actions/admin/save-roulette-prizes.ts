"use server";
import {
  createLootBoxPrize,
  updateLootBoxPrize,
  deleteLootBoxPrize,
  getAllLootBoxPrizes,
} from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

interface SaveRoulettePrizeData {
  id: string; // ID подарка (gift.id)
  lootBoxPrizeId?: string; // ID записи в lootBoxPrize (если существует)
  dropChance: number;
  isActive: boolean;
  maxWins: number;
  currentWins: number;
  color: string;
}

async function _saveRoulettePrizes(
  session: JWTSession,
  prizes: SaveRoulettePrizeData[]
) {
  try {
    // Получаем текущие призы из БД
    const currentPrizes = await getAllLootBoxPrizes();
    const currentPrizeMap = new Map(currentPrizes.map((p) => [p.gift.id, p]));

    // Обрабатываем каждый приз
    for (const prize of prizes) {
      const existingPrize = currentPrizeMap.get(prize.id);

      if (existingPrize) {
        // Обновляем существующий приз
        await updateLootBoxPrize(existingPrize.id, {
          dropChance: prize.dropChance,
          isActive: prize.isActive,
          maxWins: prize.maxWins,
        });
        currentPrizeMap.delete(prize.id); // убираем из списка для удаления
      } else {
        // Создаём новый приз
        await createLootBoxPrize({
          giftId: prize.id,
          dropChance: prize.dropChance,
          maxWins: prize.maxWins,
          isActive: prize.isActive,
          color: prize.color,
        });
      }
    }

    // Удаляем призы, которых больше нет в списке
    for (const [giftId, prizeToDelete] of currentPrizeMap) {
      await deleteLootBoxPrize(prizeToDelete.id);
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving roulette prizes:", error);
    return { success: false, error: "Failed to save prizes" };
  }
}

export const saveRoulettePrizes = withServerAuth(_saveRoulettePrizes, {
  requireRole: ["ADMIN"],
});
