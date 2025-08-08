// lib/actions/admin/create-lootbox-task.ts
import { createLootBoxTask as createLootBoxTaskDb } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";
import { CreateLootBoxTaskData } from "@/lib/types/lootbox";

async function _createLootBoxTask(
  session: JWTSession,
  data: CreateLootBoxTaskData
) {
  try {
    const task = await createLootBoxTaskDb({
      title: data.title,
      description: data.description,
      icon: data.icon || "telegram",
      channelId: data.channelId,
      chatId: data.chatId,
      channelUrl: data.channelUrl,
      sortOrder: data.sortOrder || 0,
      isActive: data.isActive ?? true,
    });

    return {
      success: true,
      data: task,
      message: "LootBox задача успешно создана",
    };
  } catch (error) {
    console.error("Error creating lootbox task:", error);
    return { success: false, error: "Failed to create lootbox task" };
  }
}

export const createLootBoxTask = withServerAuth(_createLootBoxTask, {
  requireRole: ["ADMIN"],
});
