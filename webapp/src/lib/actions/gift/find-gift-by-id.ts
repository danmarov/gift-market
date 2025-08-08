import { findGiftById as findGiftByIdDb, Gift } from "database";
import { JWTSession } from "@/lib/types/session";
import { withServerAuth } from "../auth/with-server-auth";

export type FindGiftResult =
  | { success: true; data: Gift }
  | { success: false; error: string };

async function _findGift(
  session: JWTSession,
  id: string
): Promise<FindGiftResult> {
  try {
    if (!id || typeof id !== "string" || id.trim() === "") {
      return { success: false, error: "Invalid gift ID" };
    }
    const gift = await findGiftByIdDb(id);
    if (!gift) {
      return { success: false, error: "Gift not found" };
    }

    return { success: true, data: gift };
  } catch (error) {
    console.error("Unexpected error in _findGift:", error);
    return { success: false, error: "Failed to find gift" };
  }
}

export const findGift = withServerAuth(_findGift);
