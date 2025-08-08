// actions/admin/create-gift.ts
"use server";
import { JWTSession } from "@/lib/types/session";
import { withServerAuth } from "../auth/with-server-auth";
import { createGiftSchema, CreateGiftFormData } from "@/lib/types/gift";
import { z } from "zod";
import { createGift as createGiftDb } from "database";

export type CreateGiftResult =
  | { success: true; data: { id: string; message: string } }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

async function _createGift(
  session: JWTSession,
  formData: CreateGiftFormData
): Promise<CreateGiftResult> {
  console.log("🎁 [SERVER ACTION] Получены данные подарка:", formData);

  try {
    // Валидация через zod
    console.log("🔍 [SERVER ACTION] Валидация данных...");
    const validatedData = createGiftSchema.parse(formData);
    console.log("✅ [SERVER ACTION] Данные валидны:", validatedData);

    const id = `${Date.now()}${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;

    console.log("🆔 [SERVER ACTION] Сгенерирован id:", id);

    // Преобразование данных для БД
    const giftData = {
      id: id,
      telegramGiftId: validatedData.telegram_gift_id,
      name: validatedData.name,
      description: validatedData.description,
      mediaUrl: validatedData.media_url,
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
    });

    return {
      success: true,
      data: {
        id: createdGift.id,
        message: `Подарок "${createdGift.name}" успешно создан! ID: ${createdGift.telegramGiftId}`,
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
