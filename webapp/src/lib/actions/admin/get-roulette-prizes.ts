// lib/actions/admin/get-roulette-prizes.ts
import { getAllLootBoxPrizes } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

async function _getRoulettePrizes(_: JWTSession) {
  try {
    const prizes = await getAllLootBoxPrizes();

    return { success: true, data: prizes };
  } catch (error) {
    console.error("Error getting roulette prizes:", error);
    return { success: false, error: "Failed to get prizes" };
  }
}

export const getRoulettePrizes = withServerAuth(_getRoulettePrizes, {
  requireRole: ["ADMIN"],
});
