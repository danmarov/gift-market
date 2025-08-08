// lib/actions/task/get-admin-tasks.ts
"use server";

import { CategorizedTasks, TaskWithUserStatus } from "@/lib/types/task";
import { getAllCategorizedTasksForAdmin } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

async function _getAdminTasks(session: JWTSession): Promise<{
  success: boolean;
  data?: CategorizedTasks;
  error?: string;
}> {
  try {
    // Проверяем что пользователь - админ
    if (session.role !== "ADMIN") {
      return {
        success: false,
        error: "Access denied. Admin role required.",
      };
    }

    console.log("👑 [SERVER] Getting admin tasks for user:", session.id);

    const categorizedTasks = await getAllCategorizedTasksForAdmin(session.id);

    // Преобразуем данные в нужный формат
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
      // 🔥 Дополнительные поля для админов
      isActive: task.isActive,
      isVisible: task.isVisible,
      createdAt: task.createdAt,
      startsAt: task.startsAt,
      completedCount: task.completedCount,
    });

    const result: CategorizedTasks = {
      daily: categorizedTasks.daily.map(transformTask),
      oneTime: categorizedTasks.oneTime.map(transformTask),
    };

    console.log("✅ [SERVER] Admin tasks retrieved successfully:", {
      daily: result.daily.length,
      oneTime: result.oneTime.length,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("💥 [SERVER] Error getting admin tasks:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Ошибка получения заданий",
    };
  }
}

export const getAdminTasks = withServerAuth(_getAdminTasks);
