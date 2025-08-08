// lib/actions/admin/load-more-purchases.ts
"use server";

import { getPendingPurchases, getHistoryPurchases } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

export async function _loadMorePendingAction(
  session: JWTSession,
  cursor?: string,
  limit: number = 20
) {
  try {
    console.log("🚀 [SERVER ACTION] Loading more pending purchases:", {
      cursor,
      limit,
    });

    const result = await getPendingPurchases({
      cursor, // Передаем как строку, как ожидает функция
      limit,
    });

    console.log("✅ [SERVER ACTION] More pending purchases loaded:", {
      count: result.items.length,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error(
      "💥 [SERVER ACTION] Error loading more pending purchases:",
      error
    );

    return {
      success: false,
      error: "Произошла ошибка при загрузке заказов",
    };
  }
}

export async function _loadMoreHistoryAction(
  session: JWTSession,
  cursor?: string,
  limit: number = 20
) {
  try {
    console.log("🚀 [SERVER ACTION] Loading more history purchases:", {
      cursor,
      limit,
    });

    const result = await getHistoryPurchases({
      cursor, // Передаем как строку, как ожидает функция
      limit,
    });

    console.log("✅ [SERVER ACTION] More history purchases loaded:", {
      count: result.items.length,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error(
      "💥 [SERVER ACTION] Error loading more history purchases:",
      error
    );

    return {
      success: false,
      error: "Произошла ошибка при загрузке истории заказов",
    };
  }
}

export const loadMorePending = withServerAuth(_loadMorePendingAction, {
  requireRole: "ADMIN",
});

export const loadMoreHistory = withServerAuth(_loadMoreHistoryAction, {
  requireRole: "ADMIN",
});
