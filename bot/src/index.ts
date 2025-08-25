// bot/src/index.ts
import { config } from "dotenv";
import { Bot, InlineKeyboard, InputFile } from "grammy";
import * as database from "database";
import path from "path";
import { NextFunction } from "grammy";
import fs from "fs";
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
const channelUrl = "https://t.me/reactorgift"; // Замените на ссылку вашего канала
const isProduction = process.env.production === "production";
const webappKb = new InlineKeyboard()
  .webApp("🎮 Открыть приложение", webappUrl)
  .row() // Переносим следующую кнопку на новую строку
  .url("📢 Наш канал", channelUrl);
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

function getAdminIds(): string[] {
  const adminIds = process.env.ADMIN_TELEGRAM_ID;
  if (!adminIds) return [];

  return adminIds
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

async function checkAdmin(ctx: any, next: NextFunction) {
  const adminIds = getAdminIds();
  const chatId = ctx.chat?.id?.toString();
  const telegramUser = ctx.from;

  console.log(telegramUser);

  // Проверяем, является ли чат одним из админских
  if (adminIds.length > 0 && chatId && adminIds.includes(chatId)) {
    return next();
  }

  // Если юзер есть, проверяем его ID среди админов
  if (telegramUser) {
    const telegramId = telegramUser.id.toString();

    // Проверяем, есть ли пользователь среди админов из env
    if (adminIds.includes(telegramId)) {
      return next();
    }

    try {
      const user = await database.findUserByTelegramId(telegramId);
      if (user?.role === "ADMIN") {
        return next();
      }
    } catch (error) {
      console.error("Ошибка при проверке роли:", error);
      return;
    }
  }

  // Если не админ — не пропускаем
  return;
}
// Мидлварина для проверки валидности пользователя
async function validateUser(ctx: any, next: NextFunction) {
  const telegramUser = ctx.from;

  if (!telegramUser) {
    // Если нет информации о пользователе - игнорируем
    return;
  }

  // Проверяем наличие username
  // if (!telegramUser.username || telegramUser.username.trim() === "") {
  //   await ctx.reply("пишет привет тебе чувак");
  //   return;
  // }

  // Функция для проверки подозрительного контента
  const containsSuspiciousContent = (text: string | undefined): boolean => {
    if (!text) return false;

    const suspiciousPatterns = [
      /t\.me\//i, // t.me/
      /telegram\.me\//i, // telegram.me/
      /tg:\/\//i, // tg://
      /http[s]?:\/\//i, // любые ссылки
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(text));
  };

  // Проверяем firstName и lastName на подозрительный контент
  if (
    containsSuspiciousContent(telegramUser.first_name) ||
    containsSuspiciousContent(telegramUser.last_name) ||
    containsSuspiciousContent(telegramUser.username)
  ) {
    // Логируем подозрительного пользователя
    console.log(
      `🚫 Suspicious user blocked: ${telegramUser.id} | Username: ${telegramUser.username} | FirstName: ${telegramUser.first_name} | LastName: ${telegramUser.last_name}`
    );

    // Просто игнорируем - не отвечаем ничего
    return;
  }

  // Если все проверки пройдены - продолжаем
  return next();
}

// Применяем мидлварину ко всем сообщениям и командам
bot.use(validateUser);

// Теперь все остальные обработчики будут работать только после прохождения валидации

bot.command("test_photo", checkAdmin, async (ctx) => {
  const photoPath = path.resolve(__dirname, "../assets/welcome.png");

  if (fs.existsSync(photoPath)) {
    const photo = new InputFile(photoPath);
    const sentMessage = await ctx.replyWithPhoto(photo, {
      caption: "Тест картинки",
    });

    if (sentMessage.photo && sentMessage.photo.length > 0) {
      const fileId = sentMessage.photo[sentMessage.photo.length - 1].file_id;
      await ctx.reply(`File ID: <code>${fileId}</code>`, {
        parse_mode: "HTML",
      });
      console.log("File ID:", fileId);
    }
  } else {
    console.log("No..");
  }
});

bot.command("start", async (ctx) => {
  const startPayload = ctx.match;
  const telegramId = ctx.from!.id.toString();

  // Проверяем существует ли пользователь
  const existingUser = await database.findUserByTelegramId(telegramId);

  const firstName = ctx.from?.username || ctx.from?.first_name || "друг";

  // File ID картинки приветствия
  const welcomePhotoFileId =
    "AgACAgIAAxkDAAMGaJu2p3BxlqGvyeup-Mak9t0OIq0AAv77MRvzWtlIB1bgVqWggacBAAMCAAN5AAM2BA";

  // Функция для отправки приветственного сообщения с картинкой
  const sendWelcomeMessage = async (greeting: string) => {
    const message = `<b>${greeting}, ${firstName}! 🎉</b>\n\n🎁 Лови подарки, зарабатывай звёзды и участвуй в розыгрышах`;

    // await ctx.replyWithPhoto(welcomePhotoFileId, {
    //   caption: message,
    //   parse_mode: "HTML",
    //   reply_markup: webappKb,
    // });
    // } else {
    await ctx.reply(message, {
      parse_mode: "HTML",
      reply_markup: webappKb,
    });
    // }
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
          await database.createReferral({
            referrerId: referrer.id,
            referredId: newUser.id,
            reward: 0, // 👈 0 означает что награда еще не начислена
          });

          console.log(
            `✅ Реферальная система сработала: ${referrer.telegramId} -> ${newUser.telegramId}`
          );

          // const rewardStars = 5;

          // const notificationText = `<b>🎉 Новый реферал!</b>\nВы получили боонус в размере <b>${rewardStars} ⭐</b>.`;

          // await bot.api.sendMessage(referrer.telegramId, notificationText, {
          //   parse_mode: "HTML",
          //   reply_markup: webappKb,
          // });
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
