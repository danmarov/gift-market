// lib/actions/task/claim-reward.ts
"use server";

import { claimTaskReward as dbClaimTaskReward, findTaskById } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";
import { revalidateTag } from "next/cache";
import { createCacheTag } from "@/lib/revalidation-keys";

async function _claimReward(
  session: JWTSession,
  taskId: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  reward?: number;
}> {
  try {
    console.log(
      "🔧 [SERVER] Claiming reward for user:",
      session.id,
      "task:",
      taskId
    );

    // Сначала получаем задание для знания размера награды
    const task = await findTaskById(taskId);

    if (!task) {
      return {
        success: false,
        error: "Задание не найдено",
      };
    }

    // Затем начисляем награду
    const userTask = await dbClaimTaskReward(session.id, taskId);

    console.log("✅ [SERVER] Reward claimed successfully");
    revalidateTag(createCacheTag.userTasks(session.id));
    return {
      success: true,
      data: userTask,
      reward: task.reward, // 🔥 Используем reward из task
    };
  } catch (error) {
    console.error("💥 [SERVER] Error claiming reward:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Ошибка при получении награды",
    };
  }
}

export const claimReward = withServerAuth(_claimReward);
