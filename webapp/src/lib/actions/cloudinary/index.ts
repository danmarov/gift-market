// lib/utils/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

// Инициализация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format: string;
  resourceType: string;
  bytes: number;
}

/**
 * Загружает файл в Cloudinary
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = "demo-prizes"
): Promise<UploadResult> {
  try {
    console.log("☁️ [CLOUDINARY] Начинаем загрузку файла:", {
      name: file.name,
      size: file.size,
      type: file.type,
      folder,
    });

    // Конвертируем File в Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Определяем тип ресурса
    let resourceType: "image" | "video" | "raw" = "image";

    if (file.type.startsWith("video/")) {
      resourceType = "video";
    } else if (file.name.endsWith(".tgs")) {
      // TGS файлы загружаем как raw, так как это специфичный формат Telegram
      resourceType = "raw";
    }

    console.log("📂 [CLOUDINARY] Определен тип ресурса:", resourceType);

    // Загружаем в Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folder,
            resource_type: resourceType,
            public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`, // убираем расширение
            overwrite: true,
            // Для видео включаем оптимизацию
            ...(resourceType === "video" && {
              eager: [{ quality: "auto", fetch_format: "auto" }],
            }),
          },
          (error, result) => {
            if (error) {
              console.error("❌ [CLOUDINARY] Ошибка загрузки:", error);
              reject(error);
            } else {
              console.log("✅ [CLOUDINARY] Файл успешно загружен:", {
                url: result?.secure_url,
                publicId: result?.public_id,
                format: result?.format,
                bytes: result?.bytes,
              });
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    const result = uploadResult as any;

    return {
      url: result.secure_url,
      publicId: result.public_id,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("💥 [CLOUDINARY] Критическая ошибка:", error);
    throw new Error(
      `Ошибка загрузки файла в Cloudinary: ${
        error instanceof Error ? error.message : "Неизвестная ошибка"
      }`
    );
  }
}

/**
 * Удаляет файл из Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    console.log("🗑️ [CLOUDINARY] Удаляем файл:", publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      console.log("✅ [CLOUDINARY] Файл успешно удален");
      return true;
    } else {
      console.warn("⚠️ [CLOUDINARY] Файл не найден или уже удален");
      return false;
    }
  } catch (error) {
    console.error("❌ [CLOUDINARY] Ошибка удаления:", error);
    throw new Error(
      `Ошибка удаления файла из Cloudinary: ${
        error instanceof Error ? error.message : "Неизвестная ошибка"
      }`
    );
  }
}

/**
 * Проверяет конфигурацию Cloudinary
 */
export function validateCloudinaryConfig(): boolean {
  const requiredVars = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  for (const variable of requiredVars) {
    if (!process.env[variable]) {
      console.error(
        `❌ [CLOUDINARY] Отсутствует переменная окружения: ${variable}`
      );
      return false;
    }
  }

  console.log("✅ [CLOUDINARY] Конфигурация корректна");
  return true;
}
