// lib/actions/bot.ts
"use server";

// ===== ТИПЫ =====

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  web_app?: { url: string };
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export interface NotifyAdminOptions {
  message: string;
  parseMode?: "HTML" | "Markdown";
  keyboard?: InlineKeyboardMarkup | "webapp" | "none";
  webappUrl?: string;
  webappButtonText?: string;
}

// ===== ОСНОВНЫЕ ФУНКЦИИ =====

/**
 * Проверяет является ли пользователь участником канала
 */
export async function isUserMemberOfChannel(
  userId: string,
  chatId: string
): Promise<boolean> {
  const token = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("BOT_TOKEN не задан");

  // Нормализуем chatId
  let normalizedChatId = chatId;

  // Если это username канала (не начинается с @ и не числовой ID)
  if (
    !chatId.startsWith("@") &&
    !chatId.startsWith("-") &&
    isNaN(Number(chatId))
  ) {
    normalizedChatId = `@${chatId}`;
  }

  console.log("🔍 [BOT] Checking membership:", {
    originalChatId: chatId,
    normalizedChatId,
    userId,
    tokenExists: !!token,
  });

  try {
    const url = `https://api.telegram.org/bot${token}/getChatMember?chat_id=${normalizedChatId}&user_id=${userId}`;

    console.log(
      "📞 [BOT] Making request to:",
      url.replace(token, "***TOKEN***")
    );

    const response = await fetch(url);

    console.log(
      "📡 [BOT] Response status:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [BOT] Telegram API HTTP error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        originalChatId: chatId,
        normalizedChatId,
      });
      return false;
    }

    const result = await response.json();

    if (!result.ok) {
      console.error("❌ [BOT] Telegram API result error:", {
        error_code: result.error_code,
        description: result.description,
        originalChatId: chatId,
        normalizedChatId,
        userId,
      });
      return false;
    }

    const status = result?.result?.status;
    const isSubscribed = ["member", "creator", "administrator"].includes(
      status
    );

    console.log("✅ [BOT] Membership check result:", {
      originalChatId: chatId,
      normalizedChatId,
      userId,
      status,
      isSubscribed,
    });

    return isSubscribed;
  } catch (error) {
    console.error("💥 [BOT] Error checking channel membership:", error);
    return false;
  }
}

/**
 * Отправляет уведомление администратору
 */
export async function notifyAdmin(
  options: NotifyAdminOptions
): Promise<boolean> {
  const token = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const adminId = process.env.ADMIN_TELEGRAM_ID;

  if (!token) {
    console.error("BOT_TOKEN не задан");
    return false;
  }

  if (!adminId) {
    console.error("ADMIN_TELEGRAM_ID не задан");
    return false;
  }

  try {
    const keyboard = createKeyboard(options);

    const payload: any = {
      chat_id: adminId,
      text: options.message,
      parse_mode: options.parseMode || "HTML",
    };

    if (keyboard) {
      payload.reply_markup = keyboard;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!result.ok) {
      console.error("Failed to send admin notification:", result);
      return false;
    }

    console.log("✅ Admin notification sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return false;
  }
}

/**
 * Отправляет сообщение пользователю
 */
export async function sendMessageToUser(
  userId: string,
  message: string,
  options?: {
    parseMode?: "HTML" | "Markdown";
    keyboard?: InlineKeyboardMarkup;
  }
): Promise<boolean> {
  const token = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("BOT_TOKEN не задан");
    return false;
  }

  try {
    const payload: any = {
      chat_id: userId,
      text: message,
      parse_mode: options?.parseMode || "HTML",
    };

    if (options?.keyboard) {
      payload.reply_markup = options.keyboard;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!result.ok) {
      console.error("Failed to send message to user:", result);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending message to user:", error);
    return false;
  }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

/**
 * Создает клавиатуру на основе опций
 */
function createKeyboard(
  options: NotifyAdminOptions
): InlineKeyboardMarkup | null {
  if (!options.keyboard || options.keyboard === "none") {
    return null;
  }

  // Если передали готовую клавиатуру
  if (typeof options.keyboard === "object") {
    return options.keyboard;
  }

  // Автоматическая клавиатура для webapp
  if (options.keyboard === "webapp") {
    const webappUrl = options.webappUrl || process.env.NEXT_PUBLIC_APP_URL;
    const buttonText = options.webappButtonText || "🚀 Открыть приложение";

    if (!webappUrl) {
      console.warn("webappUrl не задан для webapp клавиатуры");
      return null;
    }

    return {
      inline_keyboard: [
        [
          {
            text: buttonText,
            web_app: { url: webappUrl },
          },
        ],
      ],
    };
  }

  return null;
}

/**
 * Создает инлайн клавиатуру с кнопками
 */
export async function createInlineKeyboard(
  buttons: InlineKeyboardButton[][]
): Promise<InlineKeyboardMarkup> {
  return {
    inline_keyboard: buttons,
  };
}

/**
 * Создает кнопку для webapp
 */
export async function createWebAppButton(
  text: string,
  url: string
): Promise<InlineKeyboardButton> {
  return {
    text,
    web_app: { url },
  };
}

/**
 * Создает кнопку с URL
 */
export async function createUrlButton(
  text: string,
  url: string
): Promise<InlineKeyboardButton> {
  return {
    text,
    url,
  };
}

/**
 * Создает кнопку с callback data
 */
export async function createCallbackButton(
  text: string,
  callbackData: string
): Promise<InlineKeyboardButton> {
  return {
    text,
    callback_data: callbackData,
  };
}
