// lib/actions/task/find-task-by-id.ts
"use server";

import { findTaskById as dbFindTaskById } from "database";
import { TaskWithUserStatus, TaskIconType } from "@/lib/types/task";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

async function _findTaskById(
  session: JWTSession,
  id: string
): Promise<{
  success: boolean;
  data?: TaskWithUserStatus;
  error?: string;
}> {
  try {
    console.log("🔍 [SERVER] Finding task by ID:", id, "for user:", session.id);

    const task = await dbFindTaskById(id);

    if (!task) {
      return {
        success: false,
        error: "Задание не найдено",
      };
    }
    const taskWithUserStatus: TaskWithUserStatus = {
      ...task,
      description: task.description ?? undefined,
      startsAt: task.startsAt ?? undefined,
      maxCompletions: task.maxCompletions ?? undefined,
      icon: task.icon as TaskIconType,
      metadata: task.metadata as
        | { channelUrl?: string; chatId?: string }
        | undefined,
      userStatus: "AVAILABLE",
      startedAt: undefined,
      completedAt: undefined,
      claimedAt: undefined,
    };

    console.log("✅ [SERVER] Task found:", task.id);

    return {
      success: true,
      data: taskWithUserStatus,
    };
  } catch (error) {
    console.error("💥 [SERVER] Error finding task:", error);

    return {
      success: false,
      error: "Произошла ошибка при поиске задания",
    };
  }
}

export const findTaskById = withServerAuth(_findTaskById);
