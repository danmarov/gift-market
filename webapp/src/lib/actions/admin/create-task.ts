// lib/actions/admin/create-task.ts
"use server";

import { createTask } from "database";
import { createTaskSchema, CreateTaskFormData } from "@/lib/types/task";
import { revalidatePath } from "next/cache";

export async function createTaskAction(data: CreateTaskFormData) {
  try {
    console.log("🔧 [SERVER] Creating task with data:", data);

    // Валидируем данные на сервере
    const validationResult = createTaskSchema.safeParse(data);

    if (!validationResult.success) {
      console.error("❌ [SERVER] Validation failed:", validationResult.error);
      return {
        success: false,
        error: "Ошибка валидации данных",
        fieldErrors: validationResult.error.flatten().fieldErrors,
      };
    }

    const validData = validationResult.data;

    // Проверяем если дата в прошлом или слишком близко - делаем немедленный старт
    const now = new Date();
    let startsAt = validData.starts_at;

    if (!startsAt || startsAt <= new Date(now.getTime() + 30000)) {
      startsAt = undefined; // будет использован new Date() в createTask
      console.log("⏰ [SERVER] Start date reset to immediate");
    }

    // Формируем metadata
    const metadata =
      validData.type === "TELEGRAM_SUBSCRIPTION"
        ? {
            channelUrl: validData.channel_url,
            chatId: validData.chat_id,
          }
        : {};

    // Создаем задание в БД
    const task = await createTask({
      type: validData.type,
      duration: validData.duration,
      title: validData.title,
      description: validData.description,
      reward: validData.reward,
      icon: validData.icon,
      metadata,
      maxCompletions: validData.max_completions,
      startsAt,
    });

    console.log("✅ [SERVER] Task created successfully:", task.id);

    // Ревалидируем страницы с заданиями
    // revalidatePath("/tasks");
    // revalidatePath("/admin/tasks");

    return {
      success: true,
      data: {
        task,
        message: `Задание "${task.title}" успешно создано!`,
      },
    };
  } catch (error) {
    console.error("💥 [SERVER] Error creating task:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Произошла ошибка при создании задания",
    };
  }
}
