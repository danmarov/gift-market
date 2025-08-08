import { getAllLootBoxTasks as getAllLootBoxTasksDb } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

async function _getAllLootBoxTasks(_: JWTSession) {
  try {
    const tasks = await getAllLootBoxTasksDb();

    return { success: true, data: tasks };
  } catch (error) {
    console.error("Error getting all lootbox tasks:", error);
    return { success: false, error: "Failed to get lootbox tasks" };
  }
}

export const getAllLootBoxTasks = withServerAuth(_getAllLootBoxTasks, {
  requireRole: ["ADMIN"],
});
