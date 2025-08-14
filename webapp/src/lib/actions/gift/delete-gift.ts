"use server";
import { deleteGift as deleteGiftDb } from "database";
import { JWTSession } from "@/lib/types/session";
import { withServerAuth } from "../auth/with-server-auth";
import { revalidateTag } from "next/cache";
import { CACHE_CONSTANTS, createCacheTag } from "@/lib/revalidation-keys";

export type SearchGiftsResult =
  | {
      success: true;
    }
  | { success: false; error: string };

async function _deleteGift(
  session: JWTSession,
  id: string
): Promise<SearchGiftsResult> {
  try {
    if (!id) {
      return { success: false, error: "Gift ID was not provided" };
    }

    await deleteGiftDb(id);
    revalidateTag(createCacheTag.giftData(id)); // конкретный подарок
    revalidateTag(CACHE_CONSTANTS.TAGS.GIFTS); // каталог подарков
    return { success: true };
  } catch (error) {
    console.error("Failed to delete gift", error);
    return { success: false, error: "Failed to delete gift" };
  }
}

export const deleteGift = withServerAuth(_deleteGift, {
  requireRole: "ADMIN",
});
