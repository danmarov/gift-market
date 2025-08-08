// lib/actions/admin/get-purchases.ts
"use server";

import {
  getPurchasesByStatus,
  getPendingPurchases,
  getHistoryPurchases,
} from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

export async function _getPurchasesAction(session: JWTSession, limit?: number) {
  try {
    console.log("🚀 [SERVER ACTION] Getting purchases for admin", { limit });

    let purchases;

    if (limit) {
      // Если передан лимит, используем пагинированные методы
      const [pending, history] = await Promise.all([
        getPendingPurchases({ limit }),
        getHistoryPurchases({ limit }),
      ]);

      purchases = {
        pending: pending.items,
        history: history.items,
      };

      console.log("✅ [SERVER ACTION] Paginated purchases retrieved:", {
        pending: pending.items.length,
        history: history.items.length,
        pendingHasMore: pending.hasMore,
        historyHasMore: history.hasMore,
      });
    } else {
      // Без лимита - загружаем все (для обратной совместимости)
      purchases = await getPurchasesByStatus();

      console.log("✅ [SERVER ACTION] All purchases retrieved:", {
        pending: purchases.pending.length,
        history: purchases.history.length,
      });
    }

    return {
      success: true,
      data: purchases,
    };
  } catch (error) {
    console.error("💥 [SERVER ACTION] Error getting purchases:", error);

    return {
      success: false,
      error: "Произошла ошибка при загрузке заказов",
    };
  }
}

export const getPurchases = withServerAuth(_getPurchasesAction, {
  requireRole: "ADMIN",
});
