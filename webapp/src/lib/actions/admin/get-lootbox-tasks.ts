import { getAllLootBoxTasks as getAllLootBoxTasksDb } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";
import { unstable_cache } from "next/cache";
import { CACHE_CONSTANTS } from "@/lib/revalidation-keys";

async function _getAllLootBoxTasks(_: JWTSession) {
  try {
    const tasks = await getAllLootBoxTasksDb();

    return { success: true, data: tasks };
  } catch (error) {
    console.error("Error getting all lootbox tasks:", error);
    return { success: false, error: "Failed to get lootbox tasks" };
  }
}

const cachedGetAllLootBoxTasks = unstable_cache(
  _getAllLootBoxTasks,
  ["lootbox-tasks-admin"],
  {
    revalidate: 300, // 5 минут
    tags: [CACHE_CONSTANTS.TAGS.LOOTBOX_TASKS],
  }
);

export const getAllLootBoxTasks = withServerAuth(cachedGetAllLootBoxTasks, {
  requireRole: ["ADMIN"],
});
