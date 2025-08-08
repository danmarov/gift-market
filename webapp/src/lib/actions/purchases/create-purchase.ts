// lib/actions/purchases/create-purchase.ts
import { createPurchase as createPurchaseDb, findGiftById } from "database";
import { JWTSession } from "@/lib/types/session";
import { withServerAuth } from "../auth/with-server-auth";
import { notifyAdmin } from "../bot";

export interface CreatePurchaseParams {
  giftId: string;
  quantity: number;
}

export type CreatePurchaseResult =
  | { success: true; data: { id: number; message: string } }
  | { success: false; error: string };

async function _createPurchase(
  session: JWTSession,
  params: CreatePurchaseParams
): Promise<CreatePurchaseResult> {
  try {
    const { giftId, quantity } = params;

    // Валидация входных данных
    if (!giftId || typeof giftId !== "string" || giftId.trim() === "") {
      return { success: false, error: "Invalid gift ID" };
    }

    if (!quantity || quantity < 1 || quantity > 100) {
      return { success: false, error: "Quantity must be between 1 and 100" };
    }

    if (!Number.isInteger(quantity)) {
      return { success: false, error: "Quantity must be a whole number" };
    }

    // Получаем информацию о подарке для расчета цены
    const gift = await findGiftById(giftId);
    if (!gift) {
      return { success: false, error: "Gift not found" };
    }

    if (gift.quantity < quantity) {
      return { success: false, error: "Not enough gifts in stock" };
    }

    const totalPrice = gift.price * quantity;

    // Создаем покупку через БД
    const purchase = await createPurchaseDb({
      buyerId: session.id,
      giftId,
      quantity,
      totalPrice,
      pricePerItem: gift.price,
    });
    await notifyAdmin({
      message: `
🎉 <b>Новый заказ!</b>

👤 Пользователь: ${session.telegramId}
🎁 Подарок: ${gift.name} (x${quantity})
💰 Стоимость: ${totalPrice}⭐
📅 Время: ${new Date().toLocaleString()}
  `,
      keyboard: "webapp",
      webappButtonText: "📈 Открыть ордера",
      webappUrl: `${process.env.WEBAPP_URL}/admin/orders`,
    });
    return {
      success: true,
      data: {
        id: purchase.id,
        message: `Order #${purchase.id} created successfully!`,
      },
    };
  } catch (error: any) {
    console.error("Error in _createPurchase:", error);

    // Обрабатываем специфичные ошибки из БД
    if (error.message === "Gift not found") {
      return { success: false, error: "Ошибка при покупке подарка" };
    }
    if (error.message === "Insufficient gift quantity") {
      return { success: false, error: "Ошибка при покупке подарка" };
    }
    if (error.message === "User not found") {
      return { success: false, error: "Ошибка при покупке подарка" };
    }
    if (error.message === "Insufficient balance") {
      return { success: false, error: "Недостаточно средств на балансе" };
    }

    return { success: false, error: "Ошибка при покупке подарка" };
  }
}

export const createPurchase = withServerAuth(_createPurchase);
