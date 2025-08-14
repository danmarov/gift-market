import { findGiftById as findGiftByIdDb, Gift } from "database";
import { JWTSession } from "@/lib/types/session";
import { withServerAuth } from "../auth/with-server-auth";
import { unstable_cache } from "next/cache";
import {
  CACHE_CONSTANTS,
  createCacheKey,
  createCacheTag,
} from "@/lib/revalidation-keys";

export type FindGiftResult =
  | { success: true; data: Gift }
  | { success: false; error: string };

async function _findGift(
  session: JWTSession,
  id: string
): Promise<FindGiftResult> {
  try {
    console.log(`🔥 _findGift called for ID: ${id}`);

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

export function findGift(id: string) {
  const cached = unstable_cache(
    (session) => _findGift(session, id),
    [createCacheKey.giftDetails(id)], // "gift-details-123"
    {
      revalidate: 600, // 10 минут
      tags: [CACHE_CONSTANTS.TAGS.GIFTS, createCacheTag.giftData(id)],
    }
  );
  return withServerAuth(cached)();
}
