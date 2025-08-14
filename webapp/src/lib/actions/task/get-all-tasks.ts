// lib/actions/task/get-all-tasks.ts
"use server";

import { CategorizedTasks, TaskWithUserStatus } from "@/lib/types/task";
import {
  getCategorizedTasksForUser,
  getAllCategorizedTasksForAdmin,
} from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";
import { unstable_cache } from "next/cache";
import {
  CACHE_CONSTANTS,
  createCacheKey,
  createCacheTag,
} from "@/lib/revalidation-keys";

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

function createCachedGetAllTasks(userId: string, role: string) {
  return unstable_cache(
    (session) => _getAllTasks(session),
    [createCacheKey.userTasks(userId, role)], // "user-tasks-123-USER" или "user-tasks-456-ADMIN"
    {
      revalidate: 180, // 3 минуты (задания меняются чаще чем подарки)
      tags: [
        CACHE_CONSTANTS.TAGS.TASKS, // общий тег для всех заданий
        createCacheTag.userTasks(userId), // "tasks-user-123" - для конкретного пользователя
      ],
    }
  );
}

export async function getAllTasks() {
  return withServerAuth((session: JWTSession) => {
    const cached = createCachedGetAllTasks(session.id, session.role);
    return cached(session);
  })();
}
