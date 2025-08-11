// actions/admin/create-demo-prize.ts
"use server";
import { JWTSession } from "@/lib/types/session";
import { withServerAuth } from "../auth/with-server-auth";
import { CreateDemoPrizeFormData } from "@/components/features/admin/demo/create/create-demo-prize-form";
import { z } from "zod";
import { createDemoPrize as createDemoPrizeDb } from "database";
import { uploadToCloudinary, validateCloudinaryConfig } from "../cloudinary";

// Схема валидации для server action
const createDemoPrizeSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  description: z.string().optional().default(""),
  mediaFile: z.instanceof(File).nullable().optional(),
});

export type CreateDemoPrizeResult =
  | { success: true; data: { id: number; message: string } }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

async function _createDemoPrize(
  session: JWTSession,
  formData: CreateDemoPrizeFormData
): Promise<CreateDemoPrizeResult> {
  console.log("🎯 [SERVER ACTION] Получены данные демо-приза:", {
    name: formData.name,
    description: formData.description,
    mediaFile: formData.mediaFile
      ? {
          name: formData.mediaFile.name,
          size: formData.mediaFile.size,
          type: formData.mediaFile.type,
        }
      : null,
  });

  try {
    // Проверяем конфигурацию Cloudinary
    if (!validateCloudinaryConfig()) {
      return {
        success: false,
        error: "Cloudinary не настроен. Проверьте переменные окружения.",
      };
    }

    // Валидация через zod
    console.log("🔍 [SERVER ACTION] Валидация данных...");
    const validatedData = createDemoPrizeSchema.parse(formData);
    console.log("✅ [SERVER ACTION] Данные валидны:", {
      name: validatedData.name,
      description: validatedData.description,
      hasMediaFile: !!validatedData.mediaFile,
    });

    // Обработка медиафайла
    let mediaUrl = "";
    let cloudinaryPublicId = "";

    if (validatedData.mediaFile) {
      console.log("📁 [SERVER ACTION] Обработка медиафайла...");

      // Валидация типа файла
      const allowedTypes = ["image/gif", "video/mp4", "video/webm"];
      const isTgs = validatedData.mediaFile.name.endsWith(".tgs");

      if (!allowedTypes.includes(validatedData.mediaFile.type) && !isTgs) {
        return {
          success: false,
          error:
            "Неподдерживаемый тип файла. Разрешены только .tgs, .gif, .mp4, .webm",
        };
      }

      // Проверка размера файла (максимум 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (validatedData.mediaFile.size > maxSize) {
        return {
          success: false,
          error: "Файл слишком большой. Максимальный размер: 10MB",
        };
      }

      try {
        // Загружаем в Cloudinary
        console.log("☁️ [SERVER ACTION] Загрузка в Cloudinary...");
        const uploadResult = await uploadToCloudinary(
          validatedData.mediaFile,
          "demo-prizes"
        );

        mediaUrl = uploadResult.secureUrl;
        cloudinaryPublicId = uploadResult.publicId;

        console.log("✅ [SERVER ACTION] Файл успешно загружен в Cloudinary:", {
          url: mediaUrl,
          publicId: cloudinaryPublicId,
          size: uploadResult.bytes,
          format: uploadResult.format,
        });
      } catch (uploadError) {
        console.error(
          "❌ [SERVER ACTION] Ошибка загрузки в Cloudinary:",
          uploadError
        );
        return {
          success: false,
          error: `Ошибка загрузки файла: ${
            uploadError instanceof Error
              ? uploadError.message
              : "Неизвестная ошибка"
          }`,
        };
      }
    } else {
      console.log("⚠️ [SERVER ACTION] Медиафайл не предоставлен");
      return {
        success: false,
        error: "Медиафайл обязателен для демо-приза",
      };
    }

    // Преобразование данных для БД
    const demoPrizeData = {
      name: validatedData.name,
      description: validatedData.description || "",
      mediaUrl: mediaUrl,
      isActive: true,
      cloudinaryPublicId: cloudinaryPublicId,
    };

    // Сохранение в БД
    console.log("💾 [SERVER ACTION] Сохранение в базу данных...");
    const createdDemoPrize = await createDemoPrizeDb(demoPrizeData);

    console.log(`🎉 [SERVER ACTION] Демо-приз успешно создан:`, {
      id: createdDemoPrize.id,
      name: createdDemoPrize.name,
      mediaUrl: createdDemoPrize.mediaUrl,
      cloudinaryPublicId: cloudinaryPublicId,
    });

    return {
      success: true,
      data: {
        id: createdDemoPrize.id,
        message: `Демо-приз "${createdDemoPrize.name}" успешно создан! ID: ${createdDemoPrize.id}`,
      },
    };
  } catch (error) {
    console.error("❌ [SERVER ACTION] Ошибка при создании демо-приза:", error);

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
      // Проверка на дублирование имени (если нужно)
      if (error.message.includes("name") && error.message.includes("unique")) {
        return {
          success: false,
          error: "Демо-приз с таким названием уже существует",
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

export const createDemoPrize = withServerAuth(_createDemoPrize, {
  requireRole: "ADMIN",
});
