// actions/admin/get-demo-prizes.ts
"use server";
import { JWTSession } from "@/lib/types/session";
import { withServerAuth } from "../auth/with-server-auth";
import { getAllDemoPrizes } from "database";

export type GetDemoPrizesResult =
  | { success: true; data: DemoPrize[] }
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

async function _getDemoPrizes(
  session: JWTSession
): Promise<GetDemoPrizesResult> {
  console.log("📋 [SERVER ACTION] Получение списка демо-призов");

  try {
    const prizes = await getAllDemoPrizes();

    console.log(`✅ [SERVER ACTION] Найдено ${prizes.length} демо-призов`);

    return {
      success: true,
      data: prizes,
    };
  } catch (error) {
    console.error("❌ [SERVER ACTION] Ошибка получения демо-призов:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Неизвестная ошибка сервера",
    };
  }
}

export const getDemoPrizes = withServerAuth(_getDemoPrizes, {
  requireRole: "ADMIN",
});
