// lib/actions/admin/update-lootbox-task.ts
import { updateLootBoxTask as updateLootBoxTaskDb } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";
import { UpdateLootBoxTaskData } from "@/lib/types/lootbox";
import { revalidateTag } from "next/cache";
import { CACHE_CONSTANTS } from "@/lib/revalidation-keys";

interface UpdateLootBoxTaskActionData extends UpdateLootBoxTaskData {
  id: string;
}

async function _updateLootBoxTask(
  session: JWTSession,
  data: UpdateLootBoxTaskActionData
) {
  try {
    const { id, ...updateData } = data;

    const task = await updateLootBoxTaskDb(id, updateData);
    revalidateTag(CACHE_CONSTANTS.TAGS.LOOTBOX_TASKS);
    return {
      success: true,
      data: task,
      message: "LootBox задача успешно обновлена",
    };
  } catch (error) {
    console.error("Error updating lootbox task:", error);
    return { success: false, error: "Failed to update lootbox task" };
  }
}

export const updateLootBoxTask = withServerAuth(_updateLootBoxTask, {
  requireRole: ["ADMIN"],
});
