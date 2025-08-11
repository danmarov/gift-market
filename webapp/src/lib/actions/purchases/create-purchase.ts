// lib/actions/purchases/create-purchase.ts
import {
  createPurchase as createPurchaseDb,
  findGiftById,
  markPurchaseAsSent,
} from "database";
import { JWTSession } from "@/lib/types/session";
import { withServerAuth } from "../auth/with-server-auth";
import { notifyAdmin, sendGift } from "../bot";

export interface CreatePurchaseParams {
  giftId: string;
  quantity: number;
}

export type CreatePurchaseResult =
  | { success: true; data: { id: number; message: string; auto: boolean } }
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

    // Создаем покупку через БД (пока со статусом PENDING)
    const purchase = await createPurchaseDb({
      buyerId: session.id,
      giftId,
      quantity,
      totalPrice,
      pricePerItem: gift.price,
    });

    console.log("🎁 Purchase created:", {
      id: purchase.id,
      hasTelegramGiftId: !!(
        gift.telegramGiftId && gift.telegramGiftId.trim() !== ""
      ),
    });

    // Проверяем, можем ли отправить автоматически
    if (gift.telegramGiftId && gift.telegramGiftId.trim() !== "") {
      console.log("🤖 Attempting automatic gift delivery...");

      try {
        // Пытаемся отправить подарок через Telegram API
        for (let i = 0; i < quantity; i++) {
          const giftSent = await sendGift({
            userId: session.telegramId,
            giftId: gift.telegramGiftId,
            text: ``,
            parseMode: "HTML",
          });

          if (!giftSent) {
            throw new Error(`Failed to send gift ${i + 1} of ${quantity}`);
          }
        }

        // Если все подарки отправлены успешно, обновляем статус на SENT
        await markPurchaseAsSent(
          purchase.id,
          undefined, // telegramMessageId не нужен для автоматических
          `Автоматически отправлено ${quantity} подарков через Telegram API`
        );

        console.log("✅ Automatic gift delivery successful!");

        // Уведомляем админа об успешной автоматической отправке
        await notifyAdmin({
          message: `
✅ <b>Автоматическая отправка успешна!</b>

👤 Пользователь: ${session.telegramId}
🎁 Подарок: ${gift.name} (x${quantity})
💰 Стоимость: ${totalPrice}⭐
🤖 Статус: Автоматически отправлено
📅 Время: ${new Date().toLocaleString()}
          `,
          keyboard: "webapp",
          webappButtonText: "📈 Открыть историю",
          webappUrl: `${process.env.WEBAPP_URL}/admin/orders`,
        });

        return {
          success: true,
          data: {
            id: purchase.id,
            message: `🎉 Подарок отправлен автоматически! Заказ #${purchase.id}`,
            auto: true,
          },
        };
      } catch (autoError: any) {
        console.error("❌ Automatic gift delivery failed:", autoError);

        // Получаем сообщение об ошибке
        const errorMessage = autoError?.message || "Неизвестная ошибка";

        // Автоматическая отправка не удалась, оставляем в ручном режиме
        // Уведомляем админа о необходимости ручной отправки
        await notifyAdmin({
          message: `
⚠️ <b>Требуется ручная отправка!</b>

👤 Пользователь: ${session.telegramId}
🎁 Подарок: ${gift.name} (x${quantity})
💰 Стоимость: ${totalPrice}⭐
🤖 Автоматическая отправка не удалась: ${errorMessage}
📅 Время: ${new Date().toLocaleString()}

❗ Требуется ручная обработка заказа
          `,
          keyboard: "webapp",
          webappButtonText: "📦 Обработать заказ",
          webappUrl: `${process.env.WEBAPP_URL}/admin/orders`,
        });

        return {
          success: true,
          data: {
            id: purchase.id,
            message: `Заказ #${purchase.id} создан! Подарок будет отправлен вручную.`,
            auto: false,
          },
        };
      }
    } else {
      // Это кастомный подарок, требуется ручная отправка
      console.log("📦 Manual delivery required (no telegramGiftId)");

      await notifyAdmin({
        message: `
📦 <b>Новый заказ на ручную отправку!</b>

👤 Пользователь: ${session.telegramId}
🎁 Подарок: ${gift.name} (x${quantity})
💰 Стоимость: ${totalPrice}⭐
📅 Время: ${new Date().toLocaleString()}

❗ Требуется ручная обработка
        `,
        keyboard: "webapp",
        webappButtonText: "📦 Обработать заказ",
        webappUrl: `${process.env.WEBAPP_URL}/admin/orders`,
      });

      return {
        success: true,
        data: {
          id: purchase.id,
          message: `Заказ #${purchase.id} создан! Подарок будет отправлен администратором.`,
          auto: false,
        },
      };
    }
  } catch (error: any) {
    console.error("Error in _createPurchase:", error);

    // Обрабатываем специфичные ошибки из БД
    if (error.message === "Gift not found") {
      return { success: false, error: "Подарок не найден" };
    }
    if (error.message === "Insufficient gift quantity") {
      return { success: false, error: "Недостаточно подарков в наличии" };
    }
    if (error.message === "User not found") {
      return { success: false, error: "Пользователь не найден" };
    }
    if (error.message === "Insufficient balance") {
      return { success: false, error: "Недостаточно средств на балансе" };
    }

    return { success: false, error: "Ошибка при покупке подарка" };
  }
}

export const createPurchase = withServerAuth(_createPurchase);
