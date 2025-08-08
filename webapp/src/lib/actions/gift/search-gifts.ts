"use server";
// app/lib/actions/gift/search-gifts.ts
import { searchGiftsByName as searchGiftsByNameDb } from "database";
import { JWTSession } from "@/lib/types/session";
import { withServerAuth } from "../auth/with-server-auth";

export type SearchGiftsResult =
  | {
      success: true;
      data: Array<{
        id: string;
        name: string;
        mediaUrl: string;
        price: number;
      }>;
    }
  | { success: false; error: string };

async function _searchGifts(
  session: JWTSession,
  query: string,
  excludeIds?: string[]
): Promise<SearchGiftsResult> {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, data: [] };
    }

    const gifts = await searchGiftsByNameDb(query.trim(), {
      take: 10,
      excludeIds,
    });

    return { success: true, data: gifts };
  } catch (error) {
    console.error("Error searching gifts:", error);
    return { success: false, error: "Failed to search gifts" };
  }
}

export const searchGifts = withServerAuth(_searchGifts);
