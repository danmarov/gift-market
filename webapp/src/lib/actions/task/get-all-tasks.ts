// lib/actions/task/get-all-tasks.ts
"use server";

import { CategorizedTasks, TaskWithUserStatus } from "@/lib/types/task";
import {
  getCategorizedTasksForUser,
  getAllCategorizedTasksForAdmin,
} from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

async function _getAllTasks(session: JWTSession): Promise<{
  success: boolean;
  data?: CategorizedTasks;
  error?: string;
  isAdmin: boolean;
}> {
  try {
    const isAdmin = session.role === "ADMIN";
    console.log(`WATAFAK`, session);

    // 🔥 Выбираем нужную функцию на сервере
    const categorizedTasks = isAdmin
      ? await getAllCategorizedTasksForAdmin(session.id)
      : await getCategorizedTasksForUser(session.id);

    const transformTask = (task: any): TaskWithUserStatus => ({
      id: task.id,
      type: task.type,
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
      metadata: task.metadata,
      // Дополнительные поля для админов
      ...(isAdmin && {
        isActive: task.isActive,
        isVisible: task.isVisible,
        createdAt: task.createdAt,
        startsAt: task.startsAt,
        completedCount: task.completedCount,
        maxCompletions: task.maxCompletions,
      }),
    });

    const result: CategorizedTasks = {
      daily: categorizedTasks.daily.map(transformTask),
      oneTime: categorizedTasks.oneTime.map(transformTask),
    };

    return {
      success: true,
      data: result,
      isAdmin,
    };
  } catch (error) {
    console.error("💥 [SERVER] Error getting tasks:", error);

    return {
      success: false,
      isAdmin: false,
      error:
        error instanceof Error ? error.message : "Ошибка получения заданий",
    };
  }
}

export const getAllTasks = withServerAuth(_getAllTasks);
