// actions/admin/create-gift.ts
"use server";
import { JWTSession } from "@/lib/types/session";
import { withServerAuth } from "../auth/with-server-auth";
import { createGiftSchema, CreateGiftFormData } from "@/lib/types/gift";
import { z } from "zod";
import { createGift as createGiftDb } from "database";
import { uploadToCloudinary, validateCloudinaryConfig } from "../cloudinary";

export type CreateGiftResult =
  | { success: true; data: { id: string; message: string } }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

async function _createGift(
  session: JWTSession,
  formData: CreateGiftFormData
): Promise<CreateGiftResult> {
  console.log("🎁 [SERVER ACTION] Получены данные подарка:", {
    ...formData,
    reveal_animation_file: formData.reveal_animation_file
      ? {
          name: formData.reveal_animation_file.name,
          size: formData.reveal_animation_file.size,
          type: formData.reveal_animation_file.type,
        }
      : null,
  });

  try {
    // Проверяем конфигурацию Cloudinary если есть файл анимации
    if (formData.reveal_animation_file && !validateCloudinaryConfig()) {
      return {
        success: false,
        error: "Cloudinary не настроен. Проверьте переменные окружения.",
      };
    }

    // Валидация через zod
    console.log("🔍 [SERVER ACTION] Валидация данных...");
    const validatedData = createGiftSchema.parse(formData);
    console.log("✅ [SERVER ACTION] Данные валидны:", {
      ...validatedData,
      reveal_animation_file: validatedData.reveal_animation_file
        ? "File object"
        : null,
    });

    const id = `${Date.now()}${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;

    console.log("🆔 [SERVER ACTION] Сгенерирован id:", id);

    // Обработка файла анимации разворота
    let revealAnimationUrl = "";
    let revealMediaId = "";

    if (validatedData.reveal_animation_file) {
      console.log("🎬 [SERVER ACTION] Обработка файла анимации разворота...");

      // Валидация типа файла
      const allowedTypes = ["image/gif", "video/mp4", "video/webm"];
      const isTgs = validatedData.reveal_animation_file.name.endsWith(".tgs");

      if (
        !allowedTypes.includes(validatedData.reveal_animation_file.type) &&
        !isTgs
      ) {
        return {
          success: false,
          error:
            "Неподдерживаемый тип файла анимации. Разрешены только .tgs, .gif, .mp4, .webm",
        };
      }

      // Проверка размера файла (максимум 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (validatedData.reveal_animation_file.size > maxSize) {
        return {
          success: false,
          error: "Файл анимации слишком большой. Максимальный размер: 10MB",
        };
      }

      try {
        // Загружаем в Cloudinary
        console.log("☁️ [SERVER ACTION] Загрузка анимации в Cloudinary...");
        const uploadResult = await uploadToCloudinary(
          validatedData.reveal_animation_file,
          "gift-reveal-animations"
        );

        revealAnimationUrl = uploadResult.secureUrl;
        revealMediaId = uploadResult.publicId;

        console.log(
          "✅ [SERVER ACTION] Файл анимации успешно загружен в Cloudinary:",
          {
            url: revealAnimationUrl,
            publicId: revealMediaId,
            size: uploadResult.bytes,
            format: uploadResult.format,
          }
        );
      } catch (uploadError) {
        console.error(
          "❌ [SERVER ACTION] Ошибка загрузки анимации в Cloudinary:",
          uploadError
        );
        return {
          success: false,
          error: `Ошибка загрузки файла анимации: ${
            uploadError instanceof Error
              ? uploadError.message
              : "Неизвестная ошибка"
          }`,
        };
      }
    } else {
      console.log("⚠️ [SERVER ACTION] Файл анимации разворота не предоставлен");
    }

    // Преобразование данных для БД
    const giftData = {
      id: id,
      telegramGiftId: validatedData.telegram_gift_id,
      name: validatedData.name,
      description: validatedData.description,
      mediaUrl: validatedData.media_url,
      revealAnimation: revealAnimationUrl || null,
      revealMediaId: revealMediaId || null,
      price: validatedData.price,
      quantity: validatedData.quantity,
      specialOffer: validatedData.special_offer,
      backdropVariant: validatedData.backdrop_variant.toUpperCase() as
        | "YELLOW"
        | "BLUE",
      tags: validatedData.tags,
    };

    // Сохранение в БД
    console.log("💾 [SERVER ACTION] Сохранение в базу данных...");
    const createdGift = await createGiftDb(giftData);

    console.log(`🎉 [SERVER ACTION] Подарок успешно создан:`, {
      id: createdGift.id,
      telegramGiftId: createdGift.telegramGiftId,
      name: createdGift.name,
      price: createdGift.price,
      hasRevealAnimation: !!createdGift.revealAnimation,
    });

    return {
      success: true,
      data: {
        id: createdGift.id,
        message: `Подарок "${createdGift.name}" успешно создан! ID: ${
          createdGift.telegramGiftId
        }${revealAnimationUrl ? " (с анимацией разворота)" : ""}`,
      },
    };
  } catch (error) {
    console.error("❌ [SERVER ACTION] Ошибка при создании подарка:", error);

    // Обработка ошибок валидации zod
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};

      error.issues.forEach((err) => {
        const path = err.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(err.message);
      });

      console.log("🔥 [SERVER ACTION] Ошибки валидации:", fieldErrors);

      return {
        success: false,
        error: "Ошибка валидации данных",
        fieldErrors,
      };
    }

    // Обработка ошибок БД
    if (error instanceof Error) {
      // Проверка на дублирование telegram_gift_id
      if (
        error.message.includes("telegram_gift_id") &&
        error.message.includes("unique")
      ) {
        return {
          success: false,
          error: "Подарок с таким ID уже существует. Попробуйте еще раз.",
        };
      }
    }

    // Обработка других ошибок
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Неизвестная ошибка сервера",
    };
  }
}

export const createGift = withServerAuth(_createGift, { requireRole: "ADMIN" });
