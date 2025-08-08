// lib/actions/admin/update-purchase.ts
"use server";

import {
  markPurchaseAsSent as dbMarkPurchaseAsSent,
  cancelPurchase as dbCancelPurchase,
} from "database";
import { revalidatePath } from "next/cache";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

export async function _markPurchaseAsSentAction(
  session: JWTSession,
  purchaseId: number,
  telegramMessageId?: number,
  adminNotes?: string
) {
  try {
    console.log("🚀 [SERVER ACTION] Marking purchase as sent:", purchaseId);

    const updatedPurchase = await dbMarkPurchaseAsSent(
      purchaseId,
      telegramMessageId,
      adminNotes
    );

    console.log(
      "✅ [SERVER ACTION] Purchase marked as sent:",
      updatedPurchase.id
    );

    // Revalidate кэш
    revalidatePath("/admin/orders");

    return {
      success: true,
      data: {
        message: "Заказ отмечен как отправленный",
        purchase: updatedPurchase,
      },
    };
  } catch (error) {
    console.error("💥 [SERVER ACTION] Error marking purchase as sent:", error);

    return {
      success: false,
      error: "Произошла ошибка при отправке заказа",
    };
  }
}

export async function _cancelPurchaseAction(
  session: JWTSession,
  purchaseId: number,
  adminNotes?: string
) {
  try {
    console.log("🚀 [SERVER ACTION] Cancelling purchase:", purchaseId);

    const cancelledPurchase = await dbCancelPurchase(purchaseId, adminNotes);

    console.log("✅ [SERVER ACTION] Purchase cancelled:", cancelledPurchase.id);

    // Revalidate кэш
    revalidatePath("/admin/orders");

    return {
      success: true,
      data: {
        message: "Заказ отменен, средства возвращены",
        purchase: cancelledPurchase,
      },
    };
  } catch (error) {
    console.error("💥 [SERVER ACTION] Error cancelling purchase:", error);

    return {
      success: false,
      error: "Произошла ошибка при отмене заказа",
    };
  }
}

export const markPurchaseAsSent = withServerAuth(_markPurchaseAsSentAction, {
  requireRole: "ADMIN",
});

export const cancelPurchase = withServerAuth(_cancelPurchaseAction, {
  requireRole: "ADMIN",
});
