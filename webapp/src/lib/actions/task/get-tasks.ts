// lib/actions/tasks/get-tasks.ts
"use server";

import { CategorizedTasks, TaskWithUserStatus } from "@/lib/types/task";
import { getCategorizedTasksForUser } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

async function _getTasksForUser(session: JWTSession): Promise<{
  success: boolean;
  data?: CategorizedTasks;
  error?: string;
}> {
  try {
    console.log("📋 [SERVERRRR] Getting tasks for user:", session);

    const categorizedTasks = await getCategorizedTasksForUser(session.id);

    // Преобразуем данные в нужный формат
    const transformTask = (task: any): TaskWithUserStatus => ({
      id: task.id,
      title: task.title,
      description: task.description,
      reward: task.reward,
      icon: task.icon as any,
      duration: task.duration,
      expiresAt: task.expiresAt,
      userStatus: task.userTaskStatus,
      startedAt: task.startedAt,
      completedAt: task.completedAt,
      claimedAt: task.claimedAt,
      isActive: task.isActive,
      metadata: task.metadata,
      type: task.type,
    });

    const result: CategorizedTasks = {
      daily: categorizedTasks.daily.map(transformTask),
      oneTime: categorizedTasks.oneTime.map(transformTask),
    };

    console.log("✅ [SERVER] Tasks retrieved successfully:", {
      daily: result.daily.length,
      oneTime: result.oneTime.length,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("💥 [SERVER] Error getting tasks:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Ошибка получения заданий",
    };
  }
}

export const getTasksForUser = withServerAuth(_getTasksForUser);
