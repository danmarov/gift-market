// actions/admin/delete-demo-prize.ts
"use server";
import { JWTSession } from "@/lib/types/session";
import { withServerAuth } from "../auth/with-server-auth";
import {
  findDemoPrizeById,
  deleteDemoPrize as deleteDemoPrizeDb,
} from "database";
import { revalidatePath } from "next/cache";
import { deleteFromCloudinary } from "../cloudinary";

export type DeleteDemoPrizeResult =
  | { success: true; message: string }
  | { success: false; error: string };

async function _deleteDemoPrize(
  session: JWTSession,
  prizeId: number
): Promise<DeleteDemoPrizeResult> {
  console.log(`🗑️ [SERVER ACTION] Удаление демо-приза ID: ${prizeId}`);

  try {
    // Сначала получаем приз для удаления файла из Cloudinary
    const existingPrize = await findDemoPrizeById(prizeId);

    if (!existingPrize) {
      console.log(`⚠️ [SERVER ACTION] Демо-приз с ID ${prizeId} не найден`);
      return {
        success: false,
        error: "Демо-приз не найден",
      };
    }

    console.log(`📁 [SERVER ACTION] Найден приз: "${existingPrize.name}"`);

    // Удаляем файл из Cloudinary (если есть publicId)
    if (existingPrize.cloudinaryPublicId) {
      try {
        console.log(
          `☁️ [SERVER ACTION] Удаление файла из Cloudinary: ${existingPrize.cloudinaryPublicId}`
        );
        await deleteFromCloudinary(existingPrize.cloudinaryPublicId);
        console.log(`✅ [SERVER ACTION] Файл удален из Cloudinary`);
      } catch (cloudinaryError) {
        console.warn(
          `⚠️ [SERVER ACTION] Ошибка удаления файла из Cloudinary:`,
          cloudinaryError
        );
        // Продолжаем удаление записи из БД, даже если файл не удалился
      }
    } else {
      console.log(
        `📋 [SERVER ACTION] У приза нет cloudinaryPublicId, пропускаем удаление файла`
      );
    }

    // Удаляем запись из БД
    console.log(`💾 [SERVER ACTION] Удаление записи из базы данных...`);
    await deleteDemoPrizeDb(prizeId);

    console.log(
      `🎉 [SERVER ACTION] Демо-приз "${existingPrize.name}" успешно удален`
    );

    // // Ревалидируем страницы
    // revalidatePath("/admin/demo");
    // revalidatePath("/admin/demo/prizes");

    return {
      success: true,
      message: `Демо-приз "${existingPrize.name}" успешно удален`,
    };
  } catch (error) {
    console.error("❌ [SERVER ACTION] Ошибка при удалении демо-приза:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Неизвестная ошибка сервера",
    };
  }
}

export const deleteDemoPrize = withServerAuth(_deleteDemoPrize, {
  requireRole: "ADMIN",
});
