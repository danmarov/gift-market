"use server";
// lib/actions/lootbox/get-active-lootbox-tasks.ts
import {
  getActiveLootBoxTasks as dbGetActiveLootBoxTasks,
  getUserValidatedReferralsCount,
} from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

async function _getActiveLootBoxTasks(session: JWTSession) {
  try {
    const tasks = await dbGetActiveLootBoxTasks();
    console.log("Привет мы на сервере");
    const referals = await getUserValidatedReferralsCount(session.id);
    return { success: true, data: { tasks, referals } };
  } catch (error) {
    console.error("Error getting active lootbox tasks:", error);
    return { success: false, error: "Failed to get active lootbox tasks" };
  }
}

export const getActiveLootBoxTasks = withServerAuth(_getActiveLootBoxTasks);
