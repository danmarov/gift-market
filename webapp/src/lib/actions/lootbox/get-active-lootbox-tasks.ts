"use server";
// lib/actions/lootbox/get-active-lootbox-tasks.ts
import { getActiveLootBoxTasks as dbGetActiveLootBoxTasks } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

async function _getActiveLootBoxTasks(_: JWTSession) {
  try {
    const tasks = await dbGetActiveLootBoxTasks();
    console.log("Привет мы на сервере");
    return { success: true, data: tasks };
  } catch (error) {
    console.error("Error getting active lootbox tasks:", error);
    return { success: false, error: "Failed to get active lootbox tasks" };
  }
}

export const getActiveLootBoxTasks = withServerAuth(_getActiveLootBoxTasks);
