// actions/get-demo-prize.ts
"use server";
import { findDemoPrizeById, getActiveDemoPrizes } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

export type GetDemoPrizeResult =
  | { success: true; data: DemoPrize }
  | { success: false; error: string };

export interface DemoPrize {
  id: number;
  name: string;
  description: string | null;
  mediaUrl: string;
  cloudinaryPublicId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function _getDemoPrize(
  session: JWTSession,
  prizeId: number | "random"
): Promise<GetDemoPrizeResult> {
  console.log(`🎁 [SERVER ACTION] Получение демо-приза с ID: ${prizeId}`);

  try {
    let demoPrize;

    if (prizeId === "random") {
      console.log(
        `🎲 [SERVER ACTION] Получение случайного активного демо-приза`
      );

      // Получаем все активные демо-призы
      const activePrizes = await getActiveDemoPrizes();

      if (activePrizes.length === 0) {
        console.log(`❌ [SERVER ACTION] Активные демо-призы не найдены`);
        return {
          success: false,
          error: "Активные демо-призы не найдены",
        };
      }

      // Выбираем случайный приз
      const randomIndex = Math.floor(Math.random() * activePrizes.length);
      demoPrize = activePrizes[randomIndex];

      console.log(
        `🎲 [SERVER ACTION] Выбран случайный приз: "${demoPrize.name}" (ID: ${demoPrize.id})`
      );
    } else {
      // Получаем конкретный приз по ID
      demoPrize = await findDemoPrizeById(prizeId);

      if (!demoPrize) {
        console.log(`❌ [SERVER ACTION] Демо-приз с ID ${prizeId} не найден`);
        return {
          success: false,
          error: `Демо-приз с ID ${prizeId} не найден`,
        };
      }

      // Проверяем что приз активен
      if (!demoPrize.isActive) {
        console.log(`❌ [SERVER ACTION] Демо-приз с ID ${prizeId} неактивен`);
        return {
          success: false,
          error: `Демо-приз с ID ${prizeId} неактивен`,
        };
      }
    }

    console.log(
      `✅ [SERVER ACTION] Демо-приз найден: "${demoPrize.name}" (ID: ${demoPrize.id})`
    );

    return {
      success: true,
      data: demoPrize,
    };
  } catch (error) {
    console.error("❌ [SERVER ACTION] Ошибка получения демо-приза:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Неизвестная ошибка сервера",
    };
  }
}

export const getDemoPrize = withServerAuth(_getDemoPrize);
