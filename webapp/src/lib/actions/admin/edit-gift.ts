import {
  updateGift as updateGiftDb,
  findGiftById,
  UpdateGiftData,
  Gift,
  Prisma,
} from "database";
import { JWTSession } from "@/lib/types/session";
import { editGiftSchema } from "@/lib/types/gift";
import { withServerAuth } from "../auth/with-server-auth";
import { ZodError } from "zod";
import {
  uploadToCloudinary,
  validateCloudinaryConfig,
  deleteFromCloudinary,
} from "../cloudinary";

export type EditGiftResult =
  | { success: true; data: Gift }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

interface EditGiftFormDataWithFile extends UpdateGiftData {
  id: string;
  revealAnimationFile?: File | null;
  deleteRevealAnimation?: boolean;
}

async function _editGift(
  session: JWTSession,
  formData: EditGiftFormDataWithFile
): Promise<EditGiftResult> {
  console.log("🎁 [SERVER ACTION] Редактирование подарка:", {
    id: formData.id,
    name: formData.name,
    hasRevealAnimationFile: !!formData.revealAnimationFile,
    deleteRevealAnimation: !!formData.deleteRevealAnimation,
  });

  console.log("DELETE?:", formData.deleteRevealAnimation);

  try {
    // Получаем текущий подарок для получения старого revealMediaId
    const currentGift = await findGiftById(formData.id, true);

    if (!currentGift) {
      return {
        success: false,
        error: "Подарок не найден",
      };
    }

    // Проверяем конфигурацию Cloudinary если есть новый файл анимации
    if (formData.revealAnimationFile && !validateCloudinaryConfig()) {
      return {
        success: false,
        error: "Cloudinary не настроен. Проверьте переменные окружения.",
      };
    }

    // Создаем копию данных для обработки
    const updateData: any = { ...formData };

    // Удаляем служебные поля СРАЗУ
    delete updateData.revealAnimationFile;
    delete updateData.deleteRevealAnimation;

    // ВАЖНО: Обрабатываем файлы ПОСЛЕ удаления служебных полей

    // Если нужно удалить анимацию
    if (formData.deleteRevealAnimation) {
      console.log("🗑️ [SERVER ACTION] Удаление анимации разворота");

      // Удаляем файл из Cloudinary если он существует
      if (currentGift.revealMediaId) {
        console.log(
          "☁️ [SERVER ACTION] Удаляем файл из Cloudinary:",
          currentGift.revealMediaId
        );
        try {
          await deleteFromCloudinary(currentGift.revealMediaId);
          console.log("✅ [SERVER ACTION] Файл успешно удален из Cloudinary");
        } catch (deleteError) {
          console.warn(
            "⚠️ [SERVER ACTION] Ошибка удаления файла:",
            deleteError
          );
        }
      }

      // Очищаем поля в данных для БД
      updateData.revealAnimation = null;
      updateData.revealMediaId = null;
    }
    // Если загружается новый файл
    else if (formData.revealAnimationFile) {
      console.log(
        "🎬 [SERVER ACTION] Обработка нового файла анимации разворота..."
      );

      // Валидация типа файла
      const allowedTypes = ["image/gif", "video/mp4", "video/webm"];
      const isTgs = formData.revealAnimationFile.name.endsWith(".tgs");

      if (!allowedTypes.includes(formData.revealAnimationFile.type) && !isTgs) {
        return {
          success: false,
          error:
            "Неподдерживаемый тип файла анимации. Разрешены только .tgs, .gif, .mp4, .webm",
        };
      }

      // Проверка размера файла (максимум 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (formData.revealAnimationFile.size > maxSize) {
        return {
          success: false,
          error: "Файл анимации слишком большой. Максимальный размер: 10MB",
        };
      }

      try {
        // Загружаем новый файл в Cloudinary
        console.log(
          "☁️ [SERVER ACTION] Загрузка новой анимации в Cloudinary..."
        );
        const uploadResult = await uploadToCloudinary(
          formData.revealAnimationFile,
          "gift-reveal-animations"
        );

        // Добавляем новые данные анимации к updateData
        updateData.revealAnimation = uploadResult.secureUrl;
        updateData.revealMediaId = uploadResult.publicId;

        console.log(
          "✅ [SERVER ACTION] Новый файл анимации успешно загружен:",
          {
            url: uploadResult.secureUrl,
            publicId: uploadResult.publicId,
            size: uploadResult.bytes,
            format: uploadResult.format,
          }
        );

        // Удаляем старый файл из Cloudinary если он существует
        if (currentGift.revealMediaId) {
          console.log(
            "🗑️ [SERVER ACTION] Удаляем старый файл анимации:",
            currentGift.revealMediaId
          );
          try {
            await deleteFromCloudinary(currentGift.revealMediaId);
            console.log(
              "✅ [SERVER ACTION] Старый файл анимации успешно удален"
            );
          } catch (deleteError) {
            console.warn(
              "⚠️ [SERVER ACTION] Ошибка удаления старого файла:",
              deleteError
            );
          }
        }
      } catch (uploadError) {
        console.error(
          "❌ [SERVER ACTION] Ошибка загрузки анимации:",
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
      console.log("⚠️ [SERVER ACTION] Анимация не изменяется");
    }

    console.log("💾 [SERVER ACTION] Данные для обновления БД:", updateData);

    // Обновление в БД БЕЗ валидации Zod (так как есть поля которых нет в схеме)
    const updatedGift = await updateGiftDb(formData.id, updateData);

    console.log("🎉 [SERVER ACTION] Подарок успешно обновлен:", {
      id: updatedGift.id,
      name: updatedGift.name,
      hasRevealAnimation: !!updatedGift.revealAnimation,
      animationDeleted: formData.deleteRevealAnimation,
    });

    return { success: true, data: updatedGift };
  } catch (error) {
    console.error(
      "❌ [SERVER ACTION] Ошибка при редактировании подарка:",
      error
    );

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { success: false, error: "Gift not found" };
      }
      if (error.code === "P2002") {
        return {
          success: false,
          error: "Подарок с таким Telegram ID уже существует",
        };
      }
    }

    console.error("Unexpected error in _editGift:", error);
    return { success: false, error: "Failed to update gift" };
  }
}

export const editGift = withServerAuth(_editGift, { requireRole: "ADMIN" });
