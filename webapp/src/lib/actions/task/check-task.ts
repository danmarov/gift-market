// lib/actions/task/check-task.ts
"use server";

import { completeTask as dbCompleteTask, findTaskById } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";
import { isUserMemberOfChannel } from "../bot";

type TaskMetadata = {
  chatId: string;
  channelUrl?: string;
};

async function _checkTask(
  session: JWTSession,
  taskId: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  completed?: boolean;
}> {
  try {
    console.log(
      "🔧 [SERVER] Checking task completion for user:",
      session.id,
      "task:",
      taskId
    );

    const task = await findTaskById(taskId);
    if (!task) {
      throw new Error("Задача не найдена");
    }

    const metadata =
      typeof task.metadata === "string"
        ? (JSON.parse(task.metadata) as TaskMetadata)
        : (task.metadata as TaskMetadata);

    const chatId = metadata.chatId;
    const telegramUserId = session.telegramId;
    if (!chatId || !telegramUserId) {
      throw new Error("Ошибка при проверке задания");
    }

    const isSubscribed = await isUserMemberOfChannel(telegramUserId, chatId);
    if (isSubscribed) {
      // Если проверка прошла - помечаем задание как выполненное
      const userTask = await dbCompleteTask(session.id, taskId);

      console.log("✅ [SERVER] Task completed successfully");

      return {
        success: true,
        completed: true,
        data: userTask,
      };
    } else {
      // Если не подписан - возвращаем ошибку
      console.log("❌ [SERVER] User not subscribed");

      return {
        success: true,
        completed: false,
        error: "Вы не подписаны на канал",
      };
    }
  } catch (error) {
    console.error("💥 [SERVER] Error checking task:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Ошибка при проверке задания",
    };
  }
}

export const checkTask = withServerAuth(_checkTask);
