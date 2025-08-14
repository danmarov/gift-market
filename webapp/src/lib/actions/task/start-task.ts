// lib/actions/task/start-task.ts
"use server";

import {
  startTask as dbStartTask,
  findTaskById,
  startAndCompleteTask,
} from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";
import { revalidateTag } from "next/cache";
import { createCacheTag } from "@/lib/revalidation-keys";

async function _startTask(
  session: JWTSession,
  taskId: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    console.log(
      "🔧 [SERVER] Starting task for user:",
      session.id,
      "task:",
      taskId
    );

    // Получаем информацию о задаче
    const task = await findTaskById(taskId);
    if (!task) {
      throw new Error("Задача не найдена");
    }

    // 🔥 Для FREE_BONUS используем специальную функцию
    if (task.type === "FREE_BONUS") {
      console.log(
        "🎁 [SERVER] FREE_BONUS task - starting and completing immediately"
      );

      const userTask = await startAndCompleteTask(session.id, taskId);

      console.log("✅ [SERVER] FREE_BONUS task completed immediately");

      return {
        success: true,
        data: userTask,
      };
    }

    // 🔥 Для обычных задач стандартная логика
    const userTask = await dbStartTask(session.id, taskId);

    console.log("✅ [SERVER] Task started successfully");
    revalidateTag(createCacheTag.userTasks(session.id));
    return {
      success: true,
      data: userTask,
    };
  } catch (error) {
    console.error("💥 [SERVER] Error starting task:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Ошибка при начале выполнения задания",
    };
  }
}

export const startTask = withServerAuth(_startTask);
