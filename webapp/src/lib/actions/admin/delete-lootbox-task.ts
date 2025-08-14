// lib/actions/admin/delete-lootbox-task.ts
import { deleteLootBoxTask as deleteLootBoxTaskDb } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";
import { revalidateTag } from "next/cache";
import { CACHE_CONSTANTS } from "@/lib/revalidation-keys";

async function _deleteLootBoxTask(session: JWTSession, taskId: string) {
  try {
    await deleteLootBoxTaskDb(taskId);

    revalidateTag(CACHE_CONSTANTS.TAGS.LOOTBOX_TASKS);
    return {
      success: true,
      message: "LootBox задача успешно удалена",
    };
  } catch (error) {
    console.error("Error deleting lootbox task:", error);
    return { success: false, error: "Failed to delete lootbox task" };
  }
}

export const deleteLootBoxTask = withServerAuth(_deleteLootBoxTask, {
  requireRole: ["ADMIN"],
});
