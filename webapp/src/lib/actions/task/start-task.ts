// lib/actions/task/start-task.ts
"use server";

import { startTask as dbStartTask } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

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

    const userTask = await dbStartTask(session.id, taskId);

    console.log("✅ [SERVER] Task started successfully");

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
