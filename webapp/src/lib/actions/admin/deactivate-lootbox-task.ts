// lib/actions/admin/deactivate-lootbox-task.ts
import { deactivateLootBoxTask as deactivateLootBoxTaskDb } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";
import { revalidateTag } from "next/cache";
import { CACHE_CONSTANTS } from "@/lib/revalidation-keys";

async function _deactivateLootBoxTask(session: JWTSession, taskId: string) {
  try {
    const task = await deactivateLootBoxTaskDb(taskId);
    revalidateTag(CACHE_CONSTANTS.TAGS.LOOTBOX_TASKS);
    return {
      success: true,
      data: task,
      message: "LootBox задача деактивирована",
    };
  } catch (error) {
    console.error("Error deactivating lootbox task:", error);
    return { success: false, error: "Failed to deactivate lootbox task" };
  }
}

export const deactivateLootBoxTask = withServerAuth(_deactivateLootBoxTask, {
  requireRole: ["ADMIN"],
});
