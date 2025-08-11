// actions/admin/send-demo-link.ts
"use server";
import { JWTSession } from "@/lib/types/session";
import { withServerAuth } from "../auth/with-server-auth";
import { findUserByTelegramId, findDemoPrizeById } from "database";
import {
  sendMessageToUser,
  createInlineKeyboard,
  createWebAppButton,
} from "@/lib/actions/bot";

export type SendDemoLinkResult =
  | { success: true; message: string }
  | { success: false; error: string };

async function _sendDemoLink(
  session: JWTSession,
  telegramId: string,
  prizeId: number | "random"
): Promise<SendDemoLinkResult> {
  console.log(
    `📨 [SERVER ACTION] Отправка демо-ссылки пользователю ${telegramId} для приза ${prizeId}`
  );

  try {
    // Ищем пользователя по Telegram ID
    console.log(
      `👤 [SERVER ACTION] Поиск пользователя с telegramId: ${telegramId}`
    );
    const user = await findUserByTelegramId(telegramId);

    if (!user) {
      console.log(
        `❌ [SERVER ACTION] Пользователь с telegramId ${telegramId} не найден`
      );
      return {
        success: false,
        error: `Пользователь с ID ${telegramId} не найден`,
      };
    }

    console.log(
      `✅ [SERVER ACTION] Пользователь найден: ${
        user.firstName || "Без имени"
      } (@${user.username || "без username"})`
    );

    // Проверяем демо-приз только если это не "random"
    if (prizeId !== "random") {
      console.log(`🎁 [SERVER ACTION] Поиск демо-приза с ID: ${prizeId}`);
      const demoPrize = await findDemoPrizeById(prizeId);

      if (!demoPrize) {
        console.log(`❌ [SERVER ACTION] Демо-приз с ID ${prizeId} не найден`);
        return {
          success: false,
          error: `Демо-приз с ID ${prizeId} не найден`,
        };
      }

      if (!demoPrize.isActive) {
        console.log(`❌ [SERVER ACTION] Демо-приз с ID ${prizeId} неактивен`);
        return {
          success: false,
          error: `Демо-приз "${demoPrize.name}" неактивен`,
        };
      }

      console.log(`✅ [SERVER ACTION] Демо-приз найден: "${demoPrize.name}"`);
    } else {
      console.log(`🎲 [SERVER ACTION] Отправка ссылки на случайный демо-приз`);
    }

    // Формируем URL для демо-рулетки
    const baseUrl = process.env.WEBAPP_URL || "https://yourdomain.com";
    const demoUrl =
      prizeId === "random"
        ? `${baseUrl}/demo/random`
        : `${baseUrl}/demo/${prizeId}`;

    console.log(`🔗 [SERVER ACTION] Сформирован URL: ${demoUrl}`);

    console.log(user);
    // Создаем сообщение
    const message = `<b>Привет, ${
      user.firstName || user.username || "друг"
    }! 🎉</b>

Лови подарки, зарабатывай звёзды и участвуй в розыгрышах
`;

    // Создаем кнопку для открытия демо-рулетки
    const webAppButton = await createWebAppButton(
      "🎰 Открыть приложение",
      demoUrl
    );

    const keyboard = await createInlineKeyboard([[webAppButton]]);

    // Отправляем сообщение пользователю
    console.log(`📤 [SERVER ACTION] Отправка сообщения пользователю...`);
    const messageSent = await sendMessageToUser(telegramId, message, {
      parseMode: "HTML",
      keyboard: keyboard,
    });

    if (!messageSent) {
      console.error(
        `❌ [SERVER ACTION] Не удалось отправить сообщение пользователю ${telegramId}`
      );
      return {
        success: false,
        error:
          "Не удалось отправить сообщение в Telegram. Проверьте, что пользователь не заблокировал бота.",
      };
    }

    console.log(
      `🎉 [SERVER ACTION] Демо-ссылка успешно отправлена пользователю ${telegramId}`
    );

    return {
      success: true,
      message: `Демо успешно отправлено`,
    };
  } catch (error) {
    console.error("❌ [SERVER ACTION] Ошибка при отправке демо-ссылки:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Неизвестная ошибка сервера",
    };
  }
}

export const sendDemoLink = withServerAuth(_sendDemoLink, {
  requireRole: "ADMIN",
});
