// lib/actions/admin/get-lootbox-task-by-id.ts
import { findLootBoxTaskById } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

async function _getLootBoxTaskById(session: JWTSession, taskId: string) {
  try {
    const task = await findLootBoxTaskById(taskId);

    if (!task) {
      return { success: false, error: "LootBox task not found" };
    }

    return { success: true, data: task };
  } catch (error) {
    console.error("Error getting lootbox task by id:", error);
    return { success: false, error: "Failed to get lootbox task" };
  }
}

export const getLootBoxTaskById = withServerAuth(_getLootBoxTaskById, {
  requireRole: ["ADMIN"],
});
