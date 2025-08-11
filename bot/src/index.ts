// bot/src/index.ts
import { config } from "dotenv";
import { Bot, InlineKeyboard } from "grammy";
// import {
//   createOrUpdateUser,
//   processReferralReward,
//   findUserByTelegramId,
//   updateUserRole,
// } from "database";
import * as database from "database";
import path from "path";
import { NextFunction } from "grammy"; // для типизации, если надо

type User = Awaited<ReturnType<typeof database.findUserByTelegramId>>;

// Загружаем .env из корня проекта
config({ path: path.resolve(__dirname, "../../.env") });

const token = process.env.TELEGRAM_BOT_TOKEN;
const webappUrl =
  process.env.WEBAPP_URL || "https://твой-ngrok-url.ngrok-free.app";

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN environment variable is required");
}

const bot = new Bot(token);
const webappKb = new InlineKeyboard().webApp(
  "🎮 Открыть приложение",
  webappUrl
);
// 🚀 Функция создания/обновления пользователя
async function ensureUser(ctx: any): Promise<User | null> {
  const telegramUser = ctx.from;
  if (!telegramUser) return null;

  try {
    const user = await database.createOrUpdateUser({
      telegramId: telegramUser.id.toString(),
      username: telegramUser.username,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
      photoUrl: telegramUser.photo_url,
    });

    console.log(`👤 User ${user.telegramId} activity tracked`);
    return user;
  } catch (error) {
    console.error("Error ensuring user:", error);
    return null;
  }
}

async function checkAdmin(ctx: any, next: NextFunction) {
  const envAdminChatId = process.env.ADMIN_TELEGRAM_ID;
  const chatId = ctx.chat?.id?.toString();
  const telegramUser = ctx.from;

  console.log(telegramUser);
  // Разрешаем если чат — это админ-чат (из .env)
  if (envAdminChatId && chatId === envAdminChatId) {
    return next();
  }

  // Если юзер есть, проверяем его роль
  if (telegramUser) {
    const telegramId = telegramUser.id.toString();

    if (envAdminChatId && telegramId === envAdminChatId) {
      // Юзер — тот же, что в env (главный админ)
      return next();
    }

    try {
      const user = await database.findUserByTelegramId(telegramId);
      if (user?.role === "ADMIN") {
        return next();
      }
    } catch (error) {
      console.error("Ошибка при проверке роли:", error);
      // Не пускаем дальше при ошибке
      return;
    }
  }

  // Если не админ и не из админ-чата — не пропускаем, можно не отвечать
  return;
}

bot.command("start", async (ctx) => {
  const startPayload = ctx.match;
  const telegramId = ctx.from!.id.toString();

  // Проверяем существует ли пользователь
  const existingUser = await database.findUserByTelegramId(telegramId);

  const firstName = ctx.from?.first_name || ctx.from?.username || "друг";

  // Функция для отправки сообщения с HTML-разметкой
  const sendWelcomeMessage = async (greeting: string) => {
    const message = `<b>${greeting}, ${firstName}! 🎉</b>\n\nЛови подарки, зарабатывай звёзды и участвуй в розыгрышах`;
    await ctx.reply(message, { parse_mode: "HTML", reply_markup: webappKb });
  };

  if (existingUser) {
    // Пользователь уже существует
    if (startPayload?.startsWith("ref_")) {
      console.log(
        `🚫 User ${telegramId} уже зарегистрирован, реферальная ссылка игнорируется`
      );
      // Просто отправляем приветственное сообщение
      await sendWelcomeMessage("Привет");
    } else {
      // Обычный заход зарегистрированного пользователя
      await sendWelcomeMessage("Привет");
    }
    return;
  }

  // Новый пользователь
  if (startPayload?.startsWith("ref_")) {
    const referrerTelegramId = startPayload.replace("ref_", "");

    // Находим реферера по telegramId
    const referrer = await database.findUserByTelegramId(referrerTelegramId);

    if (referrer && referrer.telegramId !== telegramId) {
      // Создаем нового пользователя
      const newUser = await ensureUser(ctx);

      if (newUser) {
        try {
          // Обрабатываем реферальную награду
          await database.processReferralReward(referrer.id, newUser.id, 10, 5);

          console.log(
            `✅ Реферальная система сработала: ${referrer.telegramId} -> ${newUser.telegramId}`
          );

          const rewardStars = 10;

          const notificationText = `<b>🎉 Новый реферал!</b>\nВы получили боонус в размере <b>${rewardStars} ⭐</b>.`;

          await bot.api.sendMessage(referrer.telegramId, notificationText, {
            parse_mode: "HTML",
            reply_markup: webappKb,
          });
        } catch (error) {
          console.error("Ошибка при обработке реферала:", error);
        }
      }
      await sendWelcomeMessage("Добро пожаловать");
    } else {
      console.log(`❌ Невалидный реферал: ${referrerTelegramId}`);
      await ensureUser(ctx);
      await sendWelcomeMessage("Добро пожаловать");
    }
  } else {
    // Обычная регистрация нового пользователя
    await ensureUser(ctx);
    await sendWelcomeMessage("Добро пожаловать");
  }
});

bot.command("add_admin", checkAdmin, async (ctx) => {
  const args = ctx.match?.split(" ");
  const newAdminTelegramId = ctx.match?.trim();

  if (!newAdminTelegramId) {
    await ctx.reply(
      "❗ Пожалуйста, укажите Telegram ID нового администратора."
    );
    return;
  }

  try {
    const userToUpdate = await database.findUserByTelegramId(
      newAdminTelegramId
    );

    if (!userToUpdate) {
      await ctx.reply("Пользователь не найден.");
      return;
    }

    await database.updateUserRole(newAdminTelegramId, "ADMIN");

    await ctx.reply(
      `✅ Пользователь ${newAdminTelegramId} теперь администратор.`
    );
  } catch (error) {
    console.error(error);
    await ctx.reply("Ошибка при добавлении администратора.");
  }
});
bot.command("remove_admin", checkAdmin, async (ctx) => {
  const newAdminTelegramId = ctx.match?.trim();

  if (!newAdminTelegramId) {
    await ctx.reply(
      "❗ Пожалуйста, укажите Telegram ID администратора для удаления."
    );
    return;
  }

  try {
    const userToUpdate = await database.findUserByTelegramId(
      newAdminTelegramId
    );

    if (!userToUpdate) {
      await ctx.reply("Пользователь не найден.");
      return;
    }

    await database.updateUserRole(newAdminTelegramId, "USER");

    await ctx.reply(
      `✅ Пользователь ${newAdminTelegramId} больше не администратор.`
    );
  } catch (error) {
    console.error(error);
    await ctx.reply("Ошибка при удалении администратора.");
  }
});

bot.command("invoice", checkAdmin, async (ctx) => {
  const amount = parseInt(ctx.match?.trim() || "0");

  if (!amount || amount <= 0) {
    await ctx.reply(
      "❗ Пожалуйста, укажите корректную сумму звезд.\nПример: /invoice 5000"
    );
    return;
  }

  if (amount > 50000) {
    await ctx.reply("❗ Максимальная сумма за раз: 50,000 звезд");
    return;
  }

  try {
    await ctx.api.sendInvoice(
      ctx.chat.id,
      "Пополнение баланса бота",
      `Пополните баланс бота на ${amount} звезд`,
      `bot_refill_${amount}_${Date.now()}`,
      "XTR",
      [
        {
          label: `${amount} Telegram Stars`,
          amount: amount,
        },
      ]
    );

    console.log(`💰 Admin ${ctx.from?.id} created invoice for ${amount} stars`);
  } catch (error) {
    console.error("Error creating invoice:", error);
    await ctx.reply("❌ Ошибка при создании инвойса. Попробуйте позже.");
  }
});

// Обработчик успешных платежей
bot.on("message:successful_payment", async (ctx) => {
  const payment = ctx.message.successful_payment;
  const amount = payment.total_amount; // Количество звезд
  const payload = payment.invoice_payload;

  console.log(`✅ Payment received: ${amount} stars, payload: ${payload}`);

  // Здесь можно добавить логику для записи платежа в базу данных
  // Например, создать запись о пополнении баланса бота

  await ctx.reply(
    `🎉 Спасибо за поддержку!\n\n` +
      `Баланс бота пополнен на <b>${amount} ⭐</b>\n` +
      `ID транзакции: <code>${payment.telegram_payment_charge_id}</code>`,
    { parse_mode: "HTML" }
  );
});

// Обработчик pre_checkout_query (обязательно!)
bot.on("pre_checkout_query", async (ctx) => {
  // Здесь можно добавить дополнительные проверки
  // Например, проверить что товар еще доступен

  console.log(
    `Pre-checkout query from ${ctx.from?.id} for ${ctx.preCheckoutQuery.total_amount} stars`
  );

  // Подтверждаем платеж
  await ctx.answerPreCheckoutQuery(true);
});

// // 💰 Команда для проверки баланса
// bot.command("balance", async (ctx) => {
//   const user = await ensureUser(ctx);

//   if (user) {
//     await ctx.reply(`⭐ Ваш баланс: ${user.balance} звезд`);
//   } else {
//     await ctx.reply("Ошибка при получении баланса");
//   }
// });

// 🚨 Обработка ошибок
bot.catch((err) => {
  console.error("Ошибка в боте:", err);
});

// 🚀 Запуск бота
bot.start();
console.log("🤖 Бот запущен и подключен к базе данных!");
