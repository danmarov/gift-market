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

    // 🔥 FREE_BONUS не должен попадать в check (он сразу завершается в start)
    if (task.type === "FREE_BONUS") {
      console.log("🎁 [SERVER] FREE_BONUS task - should already be completed");
      return {
        success: false,
        error: "FREE_BONUS задачи не требуют проверки",
      };
    }

    // 🔥 Для TELEGRAM_SUBSCRIPTION проверяем подписку
    if (task.type === "TELEGRAM_SUBSCRIPTION") {
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
        const userTask = await dbCompleteTask(session.id, taskId);

        console.log(
          "✅ [SERVER] TELEGRAM_SUBSCRIPTION task completed successfully"
        );

        return {
          success: true,
          completed: true,
          data: userTask,
        };
      } else {
        console.log("❌ [SERVER] User not subscribed to channel");

        return {
          success: true,
          completed: false,
          error: "Вы не подписаны на канал",
        };
      }
    }

    // 🔥 Для других типов задач
    console.log("⚠️ [SERVER] Unknown task type:", task.type);
    return {
      success: false,
      error: "Неподдерживаемый тип задания",
    };
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
