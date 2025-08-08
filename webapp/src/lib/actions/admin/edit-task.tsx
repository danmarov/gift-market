// lib/actions/admin/edit-task.ts
"use server";

import { prisma as db, updateTask } from "database";
import { EditTaskActionData } from "@/lib/types/task";
import { revalidatePath } from "next/cache";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

export async function _editTaskAction(
  session: JWTSession,
  data: EditTaskActionData
) {
  try {
    console.log("🚀 [SERVER ACTION] Starting task edit:", data);

    // Проверяем существование задачи
    const existingTask = await db.task.findUnique({
      where: { id: data.id },
    });

    if (!existingTask) {
      console.error("❌ [SERVER ACTION] Task not found:", data.id);
      return {
        success: false,
        error: "Задание не найдено",
      };
    }

    const metadata: any = {};
    if (data.type === "TELEGRAM_SUBSCRIPTION") {
      if (data.channelUrl) metadata.channelUrl = data.channelUrl;
      if (data.chatId) metadata.chatId = data.chatId;
    }

    // Обновляем задачу
    const updatedTask = await updateTask(data.id, {
      type: data.type as any,
      duration: data.duration as any,
      title: data.title,
      description: data.description,
      reward: data.reward,
      icon: data.icon,
      startsAt: data.startsAt,
      maxCompletions: data.maxCompletions,
      isActive: data.isActive,
      isVisible: data.isVisible,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
    });

    console.log(
      "✅ [SERVER ACTION] Task updated successfully:",
      updatedTask.id
    );

    // Revalidate кэш
    revalidatePath("/admin/tasks");
    revalidatePath(`/admin/tasks/edit/${data.id}`);

    return {
      success: true,
      data: {
        message: "Задание успешно обновлено",
        task: updatedTask,
      },
    };
  } catch (error) {
    console.error("💥 [SERVER ACTION] Error updating task:", error);

    return {
      success: false,
      error: "Произошла ошибка при обновлении задания",
    };
  }
}

export const editTask = withServerAuth(_editTaskAction, {
  requireRole: "ADMIN",
});
